export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates an HTMLImageElement from a URL or base64 string and waits for it to load.
 * @param url - Image source URL or base64 string
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous"; // Required for CORS
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
  });
}

/**
 * Crops the given image source using crop coordinates and returns the resulting image as a blob URL.
 * @param imageSrc - Source image URL or base64 string
 * @param crop - Crop rectangle
 */
export default async function getCroppedImg(
  imageSrc: string,
  crop: Crop
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.warn("Canvas context not available, returning original image");
    return imageSrc;
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty or failed to generate blob."));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, "image/jpeg");
  });
}
