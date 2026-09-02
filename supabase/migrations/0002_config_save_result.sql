-- ════════════════════════════════════════════════════════════════
-- 0002_config_save_result.sql
--
-- update_site_config を「例外を投げる」形から「結果を返す」形に直す。
--
-- 【0001 の何が問題だったか】
-- 衝突時に errcode '40001' で例外を投げていた。40001 は Postgres の
-- serialization_failure（＝トランザクションをやり直せ）で、接続プール側が
-- 自動でリトライを繰り返すコード。結果、レスポンスが返らずタイムアウトした。
-- PostgREST の対応表でも 40* は HTTP 500 に丸められる。
--
-- 【直し方】
-- 例外をやめ、jsonb で結果を返す。呼び出し側は ok を見て分岐する。
--   成功       : {"ok": true,  "version": 2}
--   衝突       : {"ok": false, "reason": "conflict", "current_version": 3}
--   見つからない: {"ok": false, "reason": "not_found"}
--
-- 「見つからない」には、RLS で見えない場合も含む。
-- 他人のサイトの存在を教えないために、区別せず同じ返事にしてある。
-- ════════════════════════════════════════════════════════════════

-- 戻り値の型が変わるので、古い定義を落としてから作り直す
drop function if exists public.update_site_config(uuid, jsonb, integer, text);

create or replace function public.update_site_config(
  p_site_id          uuid,
  p_config           jsonb,
  p_expected_version integer,
  p_note             text default ''
) returns jsonb
language plpgsql
security invoker              -- RLS を効かせる（definer にすると穴になる）
set search_path = public
as $$
declare
  v_current integer;
  v_new     integer;
begin
  -- RLS を通して見える範囲で今の version を取る
  select version into v_current
    from public.site_configs
   where site_id = p_site_id;

  if v_current is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if v_current <> p_expected_version then
    return jsonb_build_object(
      'ok', false,
      'reason', 'conflict',
      'current_version', v_current
    );
  end if;

  update public.site_configs
     set config     = p_config,
         version    = version + 1,
         updated_at = now(),
         updated_by = auth.uid()
   where site_id = p_site_id
     and version = p_expected_version
  returning version into v_new;

  -- ここに来て書けないのは、読めるが書く権限が無いとき
  if v_new is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  insert into public.site_config_versions (site_id, config, version, note, created_by)
  values (p_site_id, p_config, v_new, p_note, auth.uid());

  return jsonb_build_object('ok', true, 'version', v_new);
end $$;

grant execute on function public.update_site_config(uuid, jsonb, integer, text) to authenticated;
