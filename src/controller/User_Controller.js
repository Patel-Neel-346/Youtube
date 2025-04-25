import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User_Model.js";
import {
  deleteOnCloudinaryWithUrl,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import { ApiRes } from "../utils/ApiRes.js";
import jwt from "jsonwebtoken";
const signedCookiesOptions = {
  httpOnly: true,
  secure: true,
  expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  signed: true, // enable signed signedCookies
};

const GenerateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const RefreshToken = await user.generateRefreshToken();
    const AccessToken = await user.generateAccessToken();

    // console.log(RefreshToken,AccessToken)
    // console.log("Refresh Token:",RefreshToken)
    // console.log("Access Token:",AccessToken)

    user.refreshToken = RefreshToken;
    user.save({ validateBeforeSave: false }); //here this validateBeforeSave method false means if Model has In default validation and For saving on field and for temp ignore validation on all feild then user this

    return {
      RefreshToken,
      AccessToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong while Generating Refresh Token and AccessToken"
    );
  }
};

export const registerUser = asyncHandler(async (req, res, next) => {
  //algorithm to register user

  //1. get the data from the request body
  //2. validate the data
  //3. check if the user already exists
  //4. take file from the request and upload it to the server
  //5. check file url
  //6. upload file to cloudinary
  //7. check file is uploaded to cloudinary
  //8. save the user to the database
  //9. remove password and refreah token from response
  //10. send the response to the client

  //1. get the data from the request body
  const { fullname, email, password, username } = req.body;

  //2. validate the data
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //3. check if the user already exists
  const ExistedUser = await User.findOne({
    $or: [
      {
        email,
      },
      {
        username: username.toLowerCase(),
      },
    ],
  });

  if (ExistedUser) {
    throw new ApiError(409, "User already exists");
  }

  //4. take file from the request and upload it to the server
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // console.log("Avatar local path:", avatarLocalPath);
  // console.log("Cover image local path:", coverImageLocalPath);

  //5. check file url
  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError(400, "Please upload avatar and cover image");
  }

  try {
    //6. upload file to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // console.log("Avatar upload response:", avatar);
    // console.log("Cover image upload response:", coverImage);

    //7. check if avatar and cover image uploaded on Cloudinary or not
    if (!avatar || !avatar.url) {
      throw new ApiError(400, "Avatar file upload failed!");
    }

    //8. create a user
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    console.log("Created user:", user);

    //9. remove password and refresh token from user
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    //check new user
    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .json(new ApiRes(200, createdUser, "User registered successfully!"));
  } catch (error) {
    console.error("Error during user registration:", error.message);
    throw error;
  }
});

export const loginUser = asyncHandler(async (req, res, next) => {
  //login user algorithm

  //1.get user email and password from body
  //2.check email and password (validate data)
  //3.check if user not exits if user is not exits then return res that user not exits in system
  //4.compare password to database password
  //5.if user not authenticated then return invalid password error
  //6.if user exits then generate an refresh and accessToken for user
  //7.then send that token with cookies to frontend

  //1.get user email and password from body
  const { username, email, password } = req.body;

  console.log(username, email, password);
  //2.check email and password (validate data)

  if (!username || !email) {
    throw new ApiError(404, "UserName or Email required!!");
  }

  //3.check if user not exits if user is not exits then return res that user not exits in system

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(401, "User does not Exits!!");
  }
  console.log(user);

  //4.compare password to database password

  const isPasswordValid = await user.isPasswordCorrect(password);

  console.log(isPasswordValid);
  //5.if user not authenticated then return invalid password error

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid User Email or Password");
  }

  //6.if user exits then generate an refresh and accessToken for user
  const { RefreshToken, AccessToken } =
    await GenerateAccessTokenAndRefreshToken(user._id);
  // console.log(RefreshToken,AccessToken)

  //7.then send that token with cookies to frontend

  const newuser = await User.findById(user._id).select("-password ");

  return res
    .status(200)
    .cookie("accessToken", AccessToken, signedCookiesOptions)
    .cookie("refreshToken", RefreshToken, signedCookiesOptions)
    .json(
      new ApiRes(
        200,
        {
          user: newuser,
          AccessToken,
          RefreshToken,
        },
        "User logged in successFully!"
      )
    );
});

export const LogoutUser = asyncHandler(async (req, res) => {
  //logout user algorithm

  //1.get user data from Verify Token User middleware
  //2.accroding to User id  find user and update Refresh token i means unset Refresh  TOken
  //3.clear cookies and send Respone to frontend

  try {
    //1.get user data from Verify Token User middleware
    if (!req.user) {
      throw new ApiError(401, "Unauthorized User!!");
    }

    //2.accroding to User id  find user and update Refresh token i means unset Refresh  TOken
    const user = await User.findByIdAndUpdate(req.user._id, {
      $unset: {
        refreshToken: 1,
      },
    });
    // console.log(user)

    //3.clear cookies and send Respone to frontend
    return res
      .status(200)
      .clearCookie("accessToken", signedCookiesOptions)
      .clearCookie("refreshToken", signedCookiesOptions)
      .json(new ApiRes(200, {}, "User Logout SuccessFully!"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while Logout user");
  }
});

export const RefreshAccessToken = asyncHandler(async (req, res) => {
  try {
    //get token from cookies that comes from frontend
    const inComingRefreshToken =
      req.signedCookies.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("Incoming refresh token:", inComingRefreshToken);

    //check token is valid or not
    if (!inComingRefreshToken) {
      throw new ApiError(401, "Unauthorized User!!");
    }

    //verify token
    const decoedToken = jwt.verify(
      inComingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log("Decoded token:", decoedToken);

    const user = await User.findById(decoedToken?._id);

    if (!user) {
      throw new ApiError(401, "Unauthorized User!!");
    }
    //check refresh token is valid or not
    if (inComingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Unauthorized User!!");
    }
    //generate new access token and refresh token

    const { RefreshToken, AccessToken } =
      await GenerateAccessTokenAndRefreshToken(user._id);

    //send response to frontend with cookies

    return res
      .status(200)
      .cookie("accessToken", AccessToken, signedCookiesOptions)
      .cookie("refreshToken", RefreshToken, signedCookiesOptions)
      .json(
        new ApiRes(
          200,
          {
            AccessToken,
            RefreshToken,
          },
          "Access token refreshed successfully!"
        )
      );
  } catch (error) {
    console.error("Error during token refresh:", error.message);
    throw new ApiError(
      500,
      "Something went wrong while refreshing access token"
    );
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  //1 get user from verify middleware req.user
  const user = req.user;

  //2 check if user exits
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //3 send response to frontend with user data

  return res
    .status(200)
    .json(new ApiRes(201, { user }, "User fetched successfully!"));
});

export const changepassword = asyncHandler(async (req, res) => {
  //1. get oldpassword and newpassword from frontend
  const { oldPassword, newPassword } = req.body;

  console.log("Old Password:", oldPassword);
  console.log("New Password:", newPassword);
  //2. check if oldpassword and newpassword is empty or not
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  //3. chekc if user exits or not
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //4. ccheck if oldpasssword is correct or not
  const isPasswordCorrectOrNot = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrectOrNot) {
    throw new ApiError(400, "Old Password is incorrect");
  }

  //5. update password with newone
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  //6. send response to frontend

  return res
    .status(200)
    .json(new ApiRes(200, {}, "Password changed SuccessFully!"));
});

export const UpdateUserDetails = asyncHandler(async (req, res) => {
  //1 get user data from req.body

  const { fullname, email } = req.body;

  //2. check if user data is empty or not
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  //3. get current data from req.user and proccess to get all data from data and Update or data

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true } // this option is used to return the updated document
  ).select("-password -refreshToken");

  //3.2. check if user exits or not
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //4. return response to frontend with updated user data

  return res
    .status(200)
    .json(new ApiRes(200, user, "User Details Updated SuccessFully!"));
});

export const UpdateUserCoverImage = asyncHandler(async (req, res) => {
  //1.get user cover image from body

  //user pasethi image levi
  //cloduinary ma upload garne update kari levi
  // console.log(req.user)

  console.log(req.file);

  const coverImageLocalPath = req.file?.path;

  console.log("Cover image local path:", coverImageLocalPath);
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Please provide cover image");
  }

  //3 delete old cover image from cloudinary
  const user = await User.findById(req.user._id);

  console.log("User Old:", user);
  if (!user) {
    throw new ApiError(404, "User not found at Cover Image");
  }

  const DeletedCoverImage = await deleteOnCloudinaryWithUrl(
    user.coverImage,
    "image"
  );

  if (!DeletedCoverImage) {
    throw new ApiError(400, "Cover image delete failed");
  }

  console.log("Deleted cover image:", DeletedCoverImage);

  //2.upload cover image to cloudinary

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage || !coverImage.url) {
    throw new ApiError(400, "Cover image upload failed");
  }

  //4. update user cover image in database
  const updatedUser = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      coverImage: coverImage.url,
    },
  }).select("-password -refreshToken");

  const finalUser = await User.findById(updatedUser._id).select(
    "-password -refreshToken"
  );

  //5 return response to frontend with updated user data

  return res
    .status(200)
    .json(new ApiRes(200, finalUser, "User Cover Image Updated SuccessFully!"));
});

export const UpdateUserAvatarImage = asyncHandler(async (req, res) => {
  //1.get user cover image from body

  //user pasethi image levi
  //cloduinary ma upload garne update kari levi
  // console.log(req.user)

  console.log(req.file);

  const AvatarImageLocalPath = req.file?.path;

  console.log("Cover image local path:", AvatarImageLocalPath);
  if (!AvatarImageLocalPath) {
    throw new ApiError(400, "Please provide cover image");
  }

  //3 delete old cover image from cloudinary
  const user = await User.findById(req.user._id);

  console.log("User Old:", user);
  if (!user) {
    throw new ApiError(404, "User not found at Cover Image");
  }

  const DeletedAvatarImage = await deleteOnCloudinaryWithUrl(
    user.avatar,
    "image"
  );

  if (!DeletedAvatarImage) {
    throw new ApiError(400, "Cover image delete failed");
  }

  console.log("Deleted cover image:", DeletedAvatarImage);

  //2.upload cover image to cloudinary

  const avatar = await uploadOnCloudinary(AvatarImageLocalPath);

  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Cover image upload failed");
  }

  //4. update user cover image in database
  const updatedUser = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      avatar: avatar.url,
    },
  }).select("-password -refreshToken");

  const finalUser = await User.findById(updatedUser._id).select(
    "-password -refreshToken"
  );

  //5 return response to frontend with updated user data

  return res
    .status(200)
    .json(
      new ApiRes(200, finalUser, "User Avatar Image Updated SuccessFully!")
    );
});
