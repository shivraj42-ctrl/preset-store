/**
 * Cloudinary URL transformation helper.
 * Takes a raw Cloudinary URL and inserts transformation parameters
 * to serve optimized images (auto-format, auto-quality, resized).
 *
 * Example input:  https://res.cloudinary.com/xxx/image/upload/v123/photo.jpg
 * Example output: https://res.cloudinary.com/xxx/image/upload/w_400,q_auto,f_auto/v123/photo.jpg
 */
export function optimizedCloudinaryUrl(
  url: string,
  width: number = 400,
  quality: string = "auto"
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // Insert transformations before the version segment (v1234...) or the filename
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const before = url.slice(0, uploadIndex + "/upload/".length);
  const after = url.slice(uploadIndex + "/upload/".length);

  return `${before}w_${width},q_${quality},f_auto/${after}`;
}
