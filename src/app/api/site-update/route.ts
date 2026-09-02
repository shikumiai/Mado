import { NextResponse } from "next/server";
import { fetchFileFromRepo, pushFileToRepo, pushBinaryFileToRepo, getFileSha } from "@/lib/github";
import { logger, safeExecute } from "@/lib/error-handler";

/**
 * POST /api/site-update
 *
 * 顧客サイトの変更をGitHubリポにpush → Vercelが自動デプロイ。
 *
 * 設計原則:
 * 1. config変更（テキスト・セクション・スタイル・画像パス）は全て1回のpushにまとめる
 * 2. 画像ファイルは先にpush、configはその後（画像が存在しないURLをconfigに書かない）
 * 3. 全pushのコミットSHAを検証して返す
 * 4. 失敗した変更は個別に報告する
 */

interface TextChange {
  type: "text";
  configPath: string;
  newValue: string;
}

interface ImageChange {
  type: "image";
  imagePath: string;
  imageData: string;
  configPath?: string;   // 画像パスをconfigにも書き込む場合
  imageUrl?: string;     // configに書き込むURL（例: /images/ceo.jpg）
}

interface SectionsChange {
  type: "sections";
  sections: Array<{ type: string; visible: boolean; label: string }>;
}

interface StyleChange {
  type: "style";
  styleChanges: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    sizes?: Record<string, string>;
    weights?: Record<string, string>;
  };
}

type Change = TextChange | ImageChange | SectionsChange | StyleChange;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, email, changes } = body;

    if (!orderId || !email || !changes || !Array.isArray(changes)) {
      return NextResponse.json({ error: "orderId, email, changes are required" }, { status: 400 });
    }

    // ─── 1. 認証 ───
    const gasUrl = process.env.GAS_WEBHOOK_URL;
    if (!gasUrl) {
      return NextResponse.json({ error: "GAS_WEBHOOK_URL not configured" }, { status: 500 });
    }

    const verifyRes = await fetch(`${gasUrl}?action=verify&orderId=${orderId}&email=${encodeURIComponent(email)}`);
    const verifyData = await verifyRes.json();

    if (!verifyData.valid) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    const repoName = verifyData.repoName || `shikumiya-${orderId.replace(/^order_/, "").slice(0, 20)}`;

    logger.info("SITE_UPDATE", `サイト更新開始: ${repoName}`, { orderId, details: { changeCount: changes.length } });

    // ─── 2. 変更を分類 ───
    const imageChanges: ImageChange[] = [];
    const configChanges: Change[] = [];

    for (const change of changes as Change[]) {
      if (change.type === "image") {
        imageChanges.push(change);
      } else {
        configChanges.push(change);
      }
    }

    const results: { field: string; ok: boolean; error?: string }[] = [];
    let configDirty = false;

    // ─── 3. 画像を先にpush ───
    // 画像ファイルが先にリポに存在していないと、configに書いたURLが404になる
    const imagePushResults: { change: ImageChange; commitSha: string }[] = [];

    for (const img of imageChanges) {
      if (!img.imagePath || !img.imageData) {
        results.push({ field: img.imagePath || "unknown", ok: false, error: "画像データが不完全" });
        continue;
      }

      const pushResult = await safeExecute("SITE_UPDATE", `画像push: ${img.imagePath}`, async () => {
        return await pushBinaryFileToRepo(
          repoName,
          img.imagePath,
          img.imageData,
          `Update image: ${img.imagePath}`
        );
      }, { orderId });

      if (pushResult.success) {
        results.push({ field: img.imagePath, ok: true });
        imagePushResults.push({ change: img, commitSha: pushResult.data.commitSha });
        logger.info("SITE_UPDATE", `画像push成功: ${img.imagePath} (commit: ${pushResult.data.commitSha.slice(0, 7)})`, { orderId });
      } else {
        results.push({ field: img.imagePath, ok: false, error: pushResult.error });
      }
    }

    // ─── 4. config変更を1つにまとめる ───
    // 現在のconfigを1回だけ取得し、全変更を適用して1回だけpush
    const hasConfigChanges = configChanges.length > 0 ||
      imagePushResults.some(r => r.change.configPath && r.change.imageUrl);

    if (hasConfigChanges) {
      const configResult = await safeExecute("SITE_UPDATE", "config一括更新", async () => {
        // 4a. 現在のconfigを取得
        const configContent = await fetchFileFromRepo(repoName, "src/app/site.config.json");
        if (!configContent) throw new Error("site.config.json not found in repository");

        let config: Record<string, unknown>;
        try {
          config = JSON.parse(configContent);
        } catch {
          throw new Error("site.config.json のパースに失敗（JSONが壊れている可能性）");
        }

        // 4b. 現在のSHAを取得（push時の競合検出用）
        const currentSha = await getFileSha(repoName, "src/app/site.config.json");
        if (!currentSha) throw new Error("site.config.json のSHA取得に失敗");

        // 4c. 全変更を適用
        const appliedFields: string[] = [];

        // テキスト変更
        for (const change of configChanges) {
          if (change.type === "text") {
            setNestedValue(config, change.configPath, change.newValue);
            appliedFields.push(change.configPath);
          }
        }

        // セクション変更
        for (const change of configChanges) {
          if (change.type === "sections") {
            config.sections = change.sections;
            appliedFields.push("sections");
          }
        }

        // スタイル変更
        for (const change of configChanges) {
          if (change.type === "style") {
            const style = (config.style || {}) as Record<string, unknown>;
            if (change.styleChanges.colors) {
              style.colors = { ...(style.colors as Record<string, string> || {}), ...change.styleChanges.colors };
            }
            if (change.styleChanges.fonts) {
              style.fonts = { ...(style.fonts as Record<string, string> || {}), ...change.styleChanges.fonts };
            }
            if (change.styleChanges.sizes) {
              style.sizes = { ...(style.sizes as Record<string, string> || {}), ...change.styleChanges.sizes };
            }
            if (change.styleChanges.weights) {
              style.weights = { ...(style.weights as Record<string, string> || {}), ...change.styleChanges.weights };
            }
            config.style = style;
            appliedFields.push("style");
          }
        }

        // 画像パス更新（push済みの画像のconfigPath）
        for (const { change } of imagePushResults) {
          if (change.configPath && change.imageUrl) {
            setNestedValue(config, change.configPath, change.imageUrl);
            appliedFields.push(change.configPath);
          }
        }

        if (appliedFields.length === 0) {
          return { commitSha: "no-change", fields: [] };
        }

        // 4d. 1回のpushで全変更をコミット
        const commitMessage = appliedFields.length <= 3
          ? `Update: ${appliedFields.join(", ")}`
          : `Update: ${appliedFields.length}件の変更`;

        const pushResult = await pushFileToRepo(
          repoName,
          "src/app/site.config.json",
          JSON.stringify(config, null, 2),
          commitMessage,
          undefined,
          currentSha,
        );

        return { commitSha: pushResult.commitSha, fields: appliedFields };
      }, { orderId });

      if (configResult.success) {
        const { commitSha, fields } = configResult.data;
        configDirty = fields.length > 0;
        for (const field of fields) {
          results.push({ field, ok: true });
        }
        if (commitSha !== "no-change") {
          logger.info("SITE_UPDATE", `config push成功 (commit: ${commitSha.slice(0, 7)}, ${fields.length}件)`, { orderId });
        }
      } else {
        // config push失敗 — 全configフィールドを失敗として記録
        const failedFields: string[] = [];
        for (const change of configChanges) {
          if (change.type === "text") failedFields.push(change.configPath);
          if (change.type === "sections") failedFields.push("sections");
          if (change.type === "style") failedFields.push("style");
        }
        for (const { change } of imagePushResults) {
          if (change.configPath) failedFields.push(change.configPath);
        }
        for (const field of failedFields) {
          results.push({ field, ok: false, error: configResult.error });
        }
      }
    }

    // ─── 5. 結果集計 ───
    const succeeded = results.filter(r => r.ok);
    const failed = results.filter(r => !r.ok);

    // ─── 6. GASに記録 ───
    try {
      await fetch(`${gasUrl}?action=save_edit&orderId=${orderId}&email=${encodeURIComponent(email)}&companyName=${encodeURIComponent(verifyData.companyName || "")}&changes=${encodeURIComponent(JSON.stringify({ total: succeeded.length, failed: failed.length }))}&requests=システム自動更新`);
    } catch {
      logger.warn("GAS_WEBHOOK", "編集記録の保存に失敗", { orderId });
    }

    // ─── 7. レスポンス ───
    if (failed.length > 0 && succeeded.length === 0) {
      // 全滅
      logger.error("SITE_UPDATE", `サイト更新完全失敗: ${failed.length}件`, { orderId });
      return NextResponse.json({
        success: false,
        error: "変更の反映に失敗しました",
        failed: failed.map(f => ({ field: f.field, error: f.error })),
      }, { status: 500 });
    }

    if (failed.length > 0) {
      // 一部失敗
      logger.warn("SITE_UPDATE", `サイト更新一部失敗: 成功${succeeded.length}件 / 失敗${failed.length}件`, { orderId });
    } else {
      logger.success("SITE_UPDATE", `サイト更新完了: ${succeeded.length}件`, { orderId });
    }

    return NextResponse.json({
      success: true,
      applied: succeeded.length,
      failed: failed.length > 0 ? failed.map(f => ({ field: f.field, error: f.error })) : undefined,
      message: failed.length > 0
        ? `${succeeded.length}件を反映しました（${failed.length}件は失敗）`
        : `${succeeded.length}件の変更を反映しました。2〜3分でサイトに表示されます。`,
    });

  } catch (err) {
    logger.error("SITE_UPDATE", "サイト更新エラー", { error: err });
    return NextResponse.json({ error: "サイトの更新に失敗しました" }, { status: 500 });
  }
}

/**
 * ドット記法でネストされたオブジェクトの値を設定
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    // 配列インデックスの処理（例: "projects.0.title"）
    const nextKey = keys[i + 1];
    const isNextIndex = /^\d+$/.test(nextKey);

    if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
      current[key] = isNextIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}
