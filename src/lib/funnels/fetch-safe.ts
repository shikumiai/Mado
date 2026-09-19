/**
 * 外の URL を安全に取りに行く道具（Codex レビュー F01 / F07 への対応）。
 *
 * 守ること
 *   ・名前解決の結果が社内・自分自身・リンクローカルのアドレスなら、つながない。
 *     判定は「接続する瞬間」に行う（undici の connect.lookup）。先に調べてから
 *     つなぐ方式だと、その間に DNS の答えが変わる抜け道が残る
 *   ・転送（301/302/303/307/308）は自動で追わない。呼ぶ側が1段ずつ確かめて追う
 *   ・本文は読み込みながら上限で止める。全部読んでから切らない
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent } from "undici";

/** つないではいけないアドレスか（IPv4 / IPv6 / IPv4 を包んだ IPv6） */
export function isPrivateIp(raw: string): boolean {
  let ip = raw.trim().toLowerCase();
  if (ip.startsWith("[") && ip.endsWith("]")) ip = ip.slice(1, -1);
  const zone = ip.indexOf("%");
  if (zone >= 0) ip = ip.slice(0, zone);

  const kind = isIP(ip);
  if (kind === 4) return isPrivateV4(ip);
  if (kind === 6) {
    // ::ffff:a.b.c.d（IPv4 を包んだ形）と 64:ff9b::a.b.c.d（NAT64）は中の IPv4 で判定
    const mapped = ip.match(/^(?:::ffff:|64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateV4(mapped[1]);
    const hex = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const a = parseInt(hex[1], 16);
      const b = parseInt(hex[2], 16);
      return isPrivateV4(`${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`);
    }
    if (ip === "::" || ip === "::1") return true;
    if (/^f[cd]/.test(ip)) return true; // fc00::/7 ユニークローカル
    if (/^fe[89ab]/.test(ip)) return true; // fe80::/10 リンクローカル
    if (/^ff/.test(ip)) return true; // マルチキャスト
    return false;
  }
  // IP として読めないものは「安全とは言えない」ので弾く
  return true;
}

function isPrivateV4(ip: string): boolean {
  const parts = ip.split(".").map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10/8
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64/10（事業者内）
  if (a === 127) return true; // ループバック
  if (a === 169 && b === 254) return true; // リンクローカル・クラウドのメタデータ
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0/24
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18/15（試験用）
  if (a >= 224) return true; // マルチキャスト・予約
  return false;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address?: string | { address: string; family: number }[],
  family?: number,
) => void;

/**
 * 接続の直前に名前を引き、公開アドレスだけを返す。
 * 1つも残らなければ接続そのものを失敗させる。
 */
function publicOnlyLookup(
  hostname: string,
  options: { all?: boolean; family?: number },
  callback: LookupCallback,
): void {
  lookup(hostname, { all: true, family: options.family || 0 })
    .then((results) => {
      const safe = results.filter((r) => !isPrivateIp(r.address));
      if (safe.length === 0) {
        const err = new Error(`blocked address for ${hostname}`) as NodeJS.ErrnoException;
        err.code = "EBLOCKEDADDRESS";
        callback(err);
        return;
      }
      if (options.all) callback(null, safe);
      else callback(null, safe[0].address, safe[0].family);
    })
    .catch((err: NodeJS.ErrnoException) => callback(err));
}

/** 公開アドレスにしかつながない通信の窓口。プロセスで1つ使い回す */
export const publicOnlyDispatcher = new Agent({
  connect: {
    // undici の型は dns.lookup と同じ形を求める。上の関数はその形に合わせてある
    lookup: publicOnlyLookup as never,
    timeout: 8_000,
  },
  headersTimeout: 8_000,
  bodyTimeout: 8_000,
});

/**
 * 1回だけ取りに行く。転送は追わない（呼ぶ側が判断する）。
 * 名前解決で社内アドレスしか出なければ、接続の段階で失敗する。
 */
export async function safeFetch(url: URL, init: RequestInit & { timeoutMs?: number } = {}): Promise<Response> {
  const { timeoutMs = 8_000, ...rest } = init;
  return fetch(url.href, {
    ...rest,
    redirect: "manual",
    signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
    // Node の fetch（undici）だけが知っている項目。型には無いので広げて渡す
    ...({ dispatcher: publicOnlyDispatcher } as object),
  });
}

/**
 * 本文を上限まで読む。上限を超えたら残りを捨てて、そこまでを返す。
 * 全部をメモリに載せてから切る方式にしない。
 */
export async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const body = res.body;
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done || !value) break;
      const room = maxBytes - total;
      if (value.byteLength >= room) {
        chunks.push(value.subarray(0, Math.max(room, 0)));
        total = maxBytes;
        await reader.cancel().catch(() => undefined);
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } catch {
    /* 途中で切れても、読めた分だけ返す */
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}
