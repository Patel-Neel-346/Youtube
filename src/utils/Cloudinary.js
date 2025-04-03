import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

cloudinary.config({
    cloud_name:"desgealde",
    api_key: "457572469465136",
    api_secret: "XtyAAB3YCpMlMzf9g6qebAX0guY"
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("Please provide a file path");
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "Youtube",
            use_filename: true,
        });

        // console.log("Cloudinary upload response:", response);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error.message);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new Error("Something went wrong while uploading file to Cloudinary");
    }
};
