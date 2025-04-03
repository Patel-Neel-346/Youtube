import express from "express";
import upload from "../middlewares/Multer_middleware.js";
import { loginUser, registerUser } from "../controller/User_Controller.js";

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
// console.log("localhost:8000/api/v1/user/register")
export default UserRoute;