import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

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


export const deleteOnCloudinaryWithUrl=async(imageUrl,option)=>{
    try{
        //1 check if imageUrl is provided
        if(!imageUrl){
            throw new ApiError(404,"Please provide imageUrl to delete image from cloudinary");  
        }
        console.log("imageUrl:",imageUrl);
        //2 split the url to get public_id

        const partsAfterUpload = imageUrl.split("/upload/")[1]; // e.g. "v1744438872/Youtube/wp6048888-4k-minimal-anime-wallpapers_ivraod.jpg"
        const parts = partsAfterUpload.split("/");              // ["v1744438872", "Youtube", "wp6048888-4k-minimal-anime-wallpapers_ivraod.jpg"]
        parts.shift(); // remove the version part (v1744438872)

        // Join the rest and remove extension
        let publicId = parts.join("/").split(".")[0]; // "Youtube/wp6048888-4k-minimal-anime-wallpapers_ivraod"

        console.log("publicId:",publicId);

        //3 check if publicId is provided
        if(!publicId){
            throw new ApiError(404,"Please provide publicId to delete image from cloudinary");  
        }

        //4 delete image from cloudinary
        const response=await cloudinary.uploader.destroy(publicId,{
            resource_type:option==="video"?"video":"image"
        });

        // const response2=await cloudinary.uploader.destroy(imageUrl,{
        //     resource_type:option==="video"?"video":"image"
        // })
        // console.log("response2:",response2);

        console.log("response:",response);

        //5 return response
        return response;

    }catch(error){
        return error;
    }
}
