import ImageKit from "imagekit";

let imagekit: ImageKit | null = null;

if (
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

export async function uploadToImageKit(
  fileBuffer: Buffer,
  fileName: string
): Promise<string | null> {
  if (!imagekit) {
    console.log("[imagekit] ImageKit credentials not configured. Skipping upload.");
    return null;
  }

  try {
    console.log(`[imagekit] Uploading ${fileName} to ImageKit...`);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: "/timetables",
    });
    console.log("[imagekit] Upload success:", response.url);
    return response.url;
  } catch (error) {
    console.error("[imagekit] Upload failed:", error);
    return null;
  }
}
