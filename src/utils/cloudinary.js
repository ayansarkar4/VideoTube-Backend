import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); 

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    // console.log("File uploaded successfully", response);
    fs.unlinkSync(localFilePath); // remove the local saved temporary file as the upload operation got success
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the local saved temporary file as the upload operation got failed

    return null;
  }
};
export default uploadOnCloudinary;
