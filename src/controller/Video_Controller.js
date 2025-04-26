import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Video } from "../models/Video_Model.js";
import { urlencoded } from "express";
import { ApiRes } from "../utils/ApiRes.js";
export const PublishVideo = asyncHandler(async (req, res) => {
  //get video title and description from User
  try {
    const {
      title,
      description,
      isPublished = true,
      categories = "",
      tags = "",
    } = req.body;

    // check if Title and Description exits
    if (!title || !description)
      throw new ApiError(400, "All fields are required");

    //check if Categorise that enter by user Included in Category
    if (categories.length > 0) {
      const isValidCategory = [
        "Autos & Vehicles",
        "Comedy",
        "Education",
        "Entertainment",
        "Film & Animation",
        "Gaming",
        "Howto & Style",
        "Music",
        "News & Politics",
        "Nonprofits & Activism",
        "People & Blogs",
        "Pets & Animals",
        "Science & Technology",
        "Sports",
        "Travel & Events",
      ].includes(categories);

      if (!isValidCategory) {
        throw new ApiError(400, "Invalid category provided");
      }
    }

    //extends tages from tages Array
    let tagsArray = [];
    if (tags.includes(",")) {
      tagsArray = tags.split(",").map((tag) => tag.trim());
    }

    const videoLocalFilePath = req.files?.videoFile[0]?.path;
    const ThumbnaillocalFilePath = req.files?.thumbnail[0]?.path;

    if (!videoLocalFilePath && !ThumbnaillocalFilePath) {
      throw new ApiError(404, "Invalid Video File and ThunbnailFile ");
    }

    const VideoFile = await uploadOnCloudinary(videoLocalFilePath);
    const ThumbnailFile = await uploadOnCloudinary(ThumbnaillocalFilePath);

    if (!VideoFile && !ThumbnailFile) {
      throw new ApiError(
        404,
        "Some Error Occur During uploading File at Cloudinary Pls Try Again"
      );
    }

    const video = await Video.create({
      videoFile: {
        fileName: VideoFile.public_id,
        url: VideoFile.url,
      },
      thumbnail: {
        fileName: ThumbnailFile.public_id,
        url: ThumbnailFile.url,
      },
      owner: req.user._id,
      title: title,
      description: description,
      duration: VideoFile.duration,
      isPublished: isPublished,
      categories: categories,
      tags: tags,
    });

    console.log(video);

    if (!video) {
      throw new ApiError(
        400,
        "Some Error occurr During uploading Video Pls Try Again"
      );
    }

    return res
      .status(201)
      .json(new ApiRes(201, video, "Video SuccessFully Uploaded On Youtube"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something Occure During APi Call Internel Server ERROR"
    );
  }
});
