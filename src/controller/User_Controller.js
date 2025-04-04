import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import User from "../models/User_Model.js";
import {uploadOnCloudinary} from '../utils/Cloudinary.js'
import {ApiRes} from '../utils/ApiRes.js'

const signedCookiesOptions = {
    httpOnly: true,
    secure: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    signed: true, // enable signed signedCookies
  };

const GenerateAccessTokenAndRefreshToken=async(userId)=>{
    
    try {
        const user=await User.findById(userId)

        const RefreshToken=await user.generateRefreshToken()
        const AccessToken=await user.generateAccessToken()
    
        user.refreshToken=RefreshToken;
        user.save({validateBeforeSave:false})//here this validateBeforeSave method false means if Model has In default validation and For saving on field and for temp ignore validation on all feild then user this
    
        return {
            RefreshToken,
            AccessToken
        } 
    } catch (error) {
        throw new ApiError(500,"Something Went Wrong while Generating Refresh Token and AccessToken")
    }
}



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
    if ([
        fullname,
        email,
        password,
        username
    ].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    //3. check if the user already exists
    const ExistedUser=await User.findOne({
        $or:[{
            email
        },
        {
            username:username.toLowerCase()
        }]
    })

    if(ExistedUser){
        throw new ApiError(409,"User already exists")
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
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        //check new user
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        return res.status(201).json(new ApiRes(200, createdUser, "User registered successfully!"));

    } catch (error) {
        console.error("Error during user registration:", error.message);
        throw error;
    }
});


export const loginUser=asyncHandler(async(req,res,next)=>{

        //login user algorithm

        //1.get user email and password from body
        //2.check email and password (validate data)
        //3.check if user not exits if user is not exits then return res that user not exits in system
        //4.compare password to database password 
        //5.if user not authenticated then return invalid password error
        //6.if user exits then generate an refresh and accessToken for user
        //7.then send that token with cookies to frontend
    

        //1.get user email and password from body
        const {username,email,password}=req.body;

        console.log(username,email,password)
        //2.check email and password (validate data)

        if(!username || !email){
            throw new ApiError(404,"UserName or Email required!!")
        }

        //3.check if user not exits if user is not exits then return res that user not exits in system

        const user = await User.findOne({
            $or:[
                {username},
                {email}
            ]
        })

        if(!user){
            throw new ApiError(401,"User does not Exits!!")
        }
        console.log(user)

        //4.compare password to database password 

        const isPasswordValid = await user.isPasswordCorrect(password)

        console.log(isPasswordValid)
        //5.if user not authenticated then return invalid password error

        if(!isPasswordValid){
            throw new ApiError(404,"Invalid User Email or Password")
        }

        //6.if user exits then generate an refresh and accessToken for user
        const {RefreshToken,AccessToken} = GenerateAccessTokenAndRefreshToken(user._id)


        //7.then send that token with cookies to frontend

        const newuser=await User.findById(user._id).select("-password ")

        return res
        .status(200)
        .cookie('accessToken',AccessToken,signedCookiesOptions)
        .cookie('refreshToken',RefreshToken,signedCookiesOptions)
        .json(
            new ApiRes(
                200,
                {
                    user:newuser,
                    AccessToken,
                    RefreshToken
                },
                "User logged in successFully!"
            )
        )
})

export const LogoutUser=asyncHandler(async(req,res)=>{
    //logout user algorithm

    //1.get user data from Verify Token User middleware
    //2.accroding to User id  find user and update Refresh token i means unset Refresh  TOken
    //3.clear cookies and send Respone to frontend


    //1.get user data from Verify Token User middleware
    if(!req.user){
        throw new ApiError(401,"Unauthorized User!!");
    }

    const user=await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1,
        },
    })
});

