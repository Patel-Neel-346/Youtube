import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary=async(localFilePath)=>{
    try {
        
        if(!localFilePath){
            throw new Error("Please provide a file path");
        }

        const respones=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
            folder:"Youtube",
            use_filename:true,
        });

        fs.unlinkSync(localFilePath);
        return respones;
        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        throw new Error("Something went wrong while uploading file on cloudinary");
    }
};
