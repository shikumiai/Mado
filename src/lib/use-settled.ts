"use client";

/**
 * 値が落ち着くまで待つ小さな仕掛け。
 *
 * 色つまみのように「動かしている間ずっと値が変わり続ける」ものを、
 * そのままプレビューに渡すと iframe を何度も読み直してしまう。
 * 手が止まってから渡すことで、見た目の追従は保ったまま読み直しを1回に減らす。
 *
 * 申し込み画面（/start）と業種別テンプレート一覧で同じものを使う。
 */

import { useEffect, useState } from "react";

export function useSettled<T>(value: T, delay = 350): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

export default useSettled;
