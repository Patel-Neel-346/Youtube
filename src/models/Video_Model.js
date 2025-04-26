import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const VideoSchema=new mongoose.Schema(
    {
        // Video file details
        videoFile: {
          fileName: {
            type: String,
            required: true, // File name is mandatory
          },
          url: {
            type: String,
            required: true, // URL of the video file is mandatory
          },
        },
        // Thumbnail details
        thumbnail: {
          fileName: {
            type: String,
            required: true, // File name of the thumbnail is mandatory
          },
          url: {
            type: String,
            required: true, // URL of the thumbnail is mandatory
          },
        },
        // Reference to the owner of the video (User model)
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Refers to the User model
          required: true, // Owner is mandatory
        },
        // Video title
        title: {
          type: String,
          required: true, // Title is mandatory
        },
        // Video description
        description: {
          type: String,
          required: true, // Description is mandatory
        },
        // Duration of the video in seconds
        duration: {
          type: Number,
          required: true, // Duration is mandatory
        },
        // Number of views for the video
        views: {
          type: Number,
          default: 0, // Default value is 0
        },
        // Whether the video is published or not
        isPublished: {
          type: Boolean,
        },
        // Category of the video
        categories: {
          type: String,
          enum: [
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
            "",
          ],
          default: "", // Default category is empty
        },
        // Tags associated with the video
        tags: [
          {
            type: String,
          },
        ],
      },
      { timestamps: true } 
);

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video=mongoose.model("Video",VideoSchema);