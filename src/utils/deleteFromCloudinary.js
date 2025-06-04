import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) {
    throw new ApiError(400, "Image URL is required");
  }

  try {
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    throw new ApiError(500, "Error deleting image from Cloudinary", err);
  }
};

export default deleteFromCloudinary;
