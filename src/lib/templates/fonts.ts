export const TEMPLATE_FONTS = [
  { id: "default", label: "テンプレート標準", css: "" },
  { id: "gothic", label: "ゴシック体", css: "var(--font-sans-jp), sans-serif" },
  { id: "mincho", label: "明朝体", css: "var(--font-serif-mincho), serif" },
  { id: "zen", label: "やわらかなゴシック", css: "var(--font-gothic-zen), sans-serif" },
  { id: "mono", label: "等幅", css: "var(--font-mono-jb), var(--font-sans-jp), monospace" },
];
export function templateFontVars(id?: string): Record<string, string> {
  const font = TEMPLATE_FONTS.find(f => f.id === id);
  return font?.css ? { "--font-sans": font.css, "--font-serif": font.css } : {};
}
