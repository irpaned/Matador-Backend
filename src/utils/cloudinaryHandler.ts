import { v2 as cloudinary } from "cloudinary";

export async function cloudinaryUpload(imagePath: string) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return await cloudinary.uploader.upload(imagePath, {
    upload_preset: "b54circle",
  });
}

export async function cloudinaryDelete(publicId: string) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return await cloudinary.uploader.destroy(publicId);
}
