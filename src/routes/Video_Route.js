import express from "express";
// import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/Auth_middleware.js";
import upload from "../middlewares/Multer_middleware.js";
import { PublishVideo } from "../controller/Video_Controller.js";
const VideoRoute = express.Router();

VideoRoute.route("/").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  PublishVideo
);

export default VideoRoute;
