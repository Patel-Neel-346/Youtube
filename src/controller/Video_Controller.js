import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
export const PublishVideo = asyncHandler(async (req, res) => {
  //get video title and description from User

  const { title, description } = req.body;

  //check if Video Title and Description are provided

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }
});
