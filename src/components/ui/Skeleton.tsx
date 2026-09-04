"use client";

/**
 * スケルトン。読み込み中の場所取り。
 * きらっと流れる動き付き（動きを止める設定なら静かな面になる）。
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = "", ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={["skeleton", className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
