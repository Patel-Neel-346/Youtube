import express from "express";
import upload from "../middlewares/Multer_middleware.js";
import { changepassword, getCurrentUser, loginUser, LogoutUser, RefreshAccessToken, registerUser, UpdateUserAvatarImage, UpdateUserCoverImage, UpdateUserDetails } from "../controller/User_Controller.js";
import { verifyJWT } from "../middlewares/Auth_middleware.js";
import User from "../models/User_Model.js";

const UserRoute=express.Router();

UserRoute.route("/register").post(upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    }
]),
registerUser

)

UserRoute.route("/login").post(loginUser)


//secure routes
UserRoute.route('/logout').post(verifyJWT,LogoutUser);


UserRoute.route('/refresh-token').get(RefreshAccessToken)


UserRoute.route('/get-user').get(verifyJWT,getCurrentUser);


UserRoute.route('/ChangePassword').post(verifyJWT,changepassword)


UserRoute.route('/Update-User').post(verifyJWT,UpdateUserDetails);


UserRoute.route('/Update-User-Cover-Image').post(verifyJWT,upload.single('coverImage'),UpdateUserCoverImage)

UserRoute.route('/Update-User-Avatar-Image').post(verifyJWT,upload.single('avatar'),UpdateUserAvatarImage)



// console.log("localhost:8000/api/v1/user/register")
export default UserRoute;