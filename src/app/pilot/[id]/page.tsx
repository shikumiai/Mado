import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/ssr";
import { isUuid, statuses, yen, type PilotOrder } from "@/lib/pilot";
import ActionForm from "@/components/pilot/ActionForm";
import OperatorForm from "@/components/pilot/OperatorForm";
import { buyerUpdate, uploadAsset } from "../actions";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const db = await createServerSupabase();
  if (!db) return <p>受付の準備中です。</p>;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect(`/auth/login?next=/pilot/${id}`);
  const { data, error } = await db
    .from("mado_pilot_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return (
      <p role="alert">
        依頼を読み込めませんでした。時間をおいて再度お試しください。
      </p>
    );
  if (!data) notFound();
  const order = data as PilotOrder;
  const { data: admin } = await db.rpc("is_platform_admin");
  const prefix = `${order.user_id}/${id}`;
  const { data: files, error: filesError } = await db.storage
    .from("mado-pilot")
    .list(prefix, {
      limit: 50,
      sortBy: { column: "created_at", order: "asc" },
    });
  const paths = (files ?? []).map((f) => `${prefix}/${f.name}`);
  const { data: signed } = paths.length
    ? await db.storage.from("mado-pilot").createSignedUrls(paths, 600)
    : { data: [] };
  const urls = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  const inputs = (
    <>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={order.version} />
    </>
  );
  return (
    <>
      <Link href="/pilot" className="m-back">
        依頼一覧に戻る
      </Link>
      <div className="m-heading">
        <h1>{order.title}</h1>
        <span className="m-status">{statuses[order.status]}</span>
      </div>
      {order.operator_note && (
        <div className="m-notice">
          <h2>運営からのご案内</h2>
          <p className="m-pre">{order.operator_note}</p>
        </div>
      )}
      <section className="m-panel">
        <h2>依頼内容</h2>
        <dl className="m-details">
          <dt>届けたい人</dt>
          <dd>{order.audience}</dd>
          <dt>商品の事実</dt>
          <dd className="m-pre">{order.facts}</dd>
          <dt>用途・目的</dt>
          <dd className="m-pre">{order.goal}</dd>
        </dl>
      </section>
      <section className="m-panel">
        <h2>{admin ? "保存済みの画像" : "商品写真"}</h2>
        {filesError && <p role="alert">画像を読み込めませんでした。</p>}
        <div className="m-gallery">
          {paths
            .filter((p) => admin || p.includes("/material-"))
            .map((p) => (
              <figure key={p}>
                {urls.get(p) && (
                  <Image
                    unoptimized
                    width={400}
                    height={400}
                    src={urls.get(p)!}
                    alt="依頼に添付された商品画像"
                  />
                )}
                {admin && <figcaption>画像 {paths.indexOf(p) + 1}</figcaption>}
              </figure>
            ))}
        </div>
        {!paths.length && (
          <p>
            商品写真を追加してください。写真と依頼内容がそろってから、運営が見積をご案内します。
          </p>
        )}
        {(admin || order.status === "requested") && (
          <ActionForm
            action={uploadAsset}
            label={admin ? "画像を保存する" : "商品写真を追加する"}
          >
            <input type="hidden" name="id" value={id} />
            {admin && (
              <label>
                用途
                <select
                  name="kind"
                  defaultValue={
                    order.status === "requested" ? "material" : "output"
                  }
                >
                  <option value="material">元の商品写真</option>
                  <option value="output">制作案・納品画像</option>
                </select>
              </label>
            )}
            <label>
              画像を選択
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            <p className="m-small">
              JPEG・PNG・WebP、1枚3MBまで。商品写真は最大5枚。提出用の画像は長辺2,000pxまでに調整します。
            </p>
          </ActionForm>
        )}
      </section>
      {order.quote_yen && (
        <section className="m-panel">
          <h2>今回のお見積り</h2>
          <p className="m-price">
            {yen(order.quote_yen)}
            <small>税込</small>
          </p>
          <p className="m-pre">{order.quote_scope}</p>
          <p>
            入金状況：
            {order.payment_confirmed ? "運営が入金を確認済み" : "入金確認前"}
          </p>
          {order.quote_accepted_at ? (
            <p className="m-notice">
              見積への同意を受け付けています。
              {!order.payment_confirmed && "上記の支払い方法をご確認ください。"}
            </p>
          ) : (
            order.status === "quoted" &&
            order.user_id === user.id && (
              <ActionForm action={buyerUpdate} label="この見積に同意する">
                {inputs}
                <input type="hidden" name="action" value="accept" />
                <label className="m-check">
                  <input type="checkbox" name="agree" required />
                  税込金額・制作範囲・納期・支払い方法を確認しました。
                </label>
                <p className="m-small">このボタンで決済は行われません。</p>
              </ActionForm>
            )
          )}
        </section>
      )}
      {order.variants.length === 3 && (
        <section className="m-comparison">
          <h2>3つの案を、見比べる。</h2>
          <div className="m-three">
            {order.variants.map((v, i) => (
              <article key={i} className="m-variant">
                <span className="m-number">案{i + 1}</span>
                {urls.get(v.path) && (
                  <Image
                    unoptimized
                    width={640}
                    height={640}
                    src={urls.get(v.path)!}
                    alt={`案${i + 1}：${v.title}`}
                  />
                )}
                <h3>{v.title}</h3>
                <p>{v.description}</p>
                <small>制作方法：{v.creator}</small>
              </article>
            ))}
          </div>
          <h3>人が選んだ理由</h3>
          {order.feedback.length ? (
            <>
              <p>
                {order.feedback.length}
                件の感想です。少人数の比較結果であり、売上の向上を保証するものではありません。
              </p>
              <div className="m-feedback">
                {order.feedback.map((f, i) => (
                  <blockquote key={i}>
                    <p>{f.reason}</p>
                    <footer>
                      {f.respondent}・案{f.choice}を選択
                    </footer>
                  </blockquote>
                ))}
              </div>
            </>
          ) : (
            <p>
              比較コメントはまだ届いていません。集まり次第、この画面に掲載します。
            </p>
          )}
          {order.selected_variant ? (
            <div className="m-notice">
              <strong>採用案：案{order.selected_variant}</strong>
              {order.revision_note && (
                <p className="m-pre">修正希望：{order.revision_note}</p>
              )}
            </div>
          ) : (
            order.status === "review" &&
            order.user_id === user.id && (
              <section className="m-panel">
                <h3>使いたい案を選ぶ</h3>
                <ActionForm
                  action={buyerUpdate}
                  label="採用案と修正希望を確定する"
                >
                  {inputs}
                  <input type="hidden" name="action" value="choose" />
                  <label>
                    採用する案
                    <select name="selected_variant" required defaultValue="">
                      <option value="" disabled>
                        1案を選んでください
                      </option>
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>
                          案{n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    1回の修正で調整したいこと（任意）
                    <textarea
                      name="revision_note"
                      rows={3}
                      maxLength={1000}
                      placeholder="見積で合意した範囲でご記入ください。"
                    />
                  </label>
                  <p className="m-small">
                    確定後は運営が仕上げに進みます。選択と修正希望を一緒にご確認ください。
                  </p>
                </ActionForm>
              </section>
            )
          )}
        </section>
      )}
      {order.status === "delivered" && urls.get(order.delivery_path) && (
        <section className="m-panel">
          <h2>完成した画像</h2>
          <Image
            unoptimized
            width={640}
            height={640}
            src={urls.get(order.delivery_path)!}
            alt="最終納品画像"
          />
          <a
            className="m-button"
            href={urls.get(order.delivery_path)!}
            target="_blank"
            rel="noreferrer"
          >
            納品画像を開いて保存する
          </a>
          <p className="m-small">
            リンクが期限切れの場合は、この画面を再読み込みしてください。
          </p>
        </section>
      )}
      {admin && <OperatorForm order={order} paths={paths} />}
    </>
  );
}
