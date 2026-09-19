/** 端末内で向きを整えて圧縮する。EXIFを持ち越さず、公開時の枠にはCSSで合わせる。 */
export async function preparePhoto(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) {
    throw new Error("JPEG・PNG・WebP・AVIF の写真を選んでください。HEIC は端末で JPEG に変換すると使えます。");
  }
  if (file.size > 30 * 1024 * 1024) throw new Error("写真が大きすぎます。30MB以下の写真を選んでください。");
  const { default: compress } = await import("browser-image-compression");
  const result = await compress(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    fileType: "image/jpeg",
    useWebWorker: true,
    preserveExif: false,
  });
  // この上限はNextのServer Action（4MB）より小さく保つ。
  if (result.size > 1024 * 1024) throw new Error("写真を小さくできませんでした。別の写真でお試しください。");
  return new File([result], "photo.jpg", { type: "image/jpeg" });
}
