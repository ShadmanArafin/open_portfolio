/**
 * The browser-read pixel size of an image file, or null.
 *
 * Decoding pixels is the one thing a server would need a real image library
 * for, and the browser can do it for free while the upload is in flight. The
 * server checks the shape before trusting it. Shared by every uploader in the
 * admin so the library always gets the same treatment.
 */
export function probeDimensions(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const finish = (value: string | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    img.onload = () =>
      finish(
        img.naturalWidth && img.naturalHeight ? `${img.naturalWidth}x${img.naturalHeight}` : null
      );
    img.onerror = () => finish(null);
    img.src = url;
  });
}
