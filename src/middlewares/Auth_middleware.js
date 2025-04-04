import jwt from "jsonwebtoken";
import User from "../models/User_Model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";


export const verifyJWT=asyncHandler(async(req,_,next)=>{
    //verify jwt token

    //1. get token from cookies or header
    //2. if token exits then decoed it otherwise return res "Unauthroized"
    //3 . if token is valid then get user id from token and find user in database
    //4. if user is not exits then return res "Unauthroized"
    //5. if user is exits then attach user to req and call next middleware


    try {
        //1. get token from cookies or header
        const token=req.signedCookies.accessToken || req.header("Auhorization")?.replace("Bearer ","")

        //2. if token exits then decoed it otherwise return res "Unauthroized"

        if(!token){
            return next(new ApiError(401,"Unauthroized User!"))
        }

        //3. if token is valid then get user id from token and find user in database

        const decoedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        if(!decoedToken){
            return next(new ApiError(401,"Unauthroized User!"))
        }
        //4. if user is not exits then return res "Unauthroized"
        const user = await User.findById(decoedToken?._id).select("-password -refreshToken");

        if(!user){
            return next(new ApiError(401,"Unauthroized User And User Not Found!"))
        }

        //5. if user is exits then attach user to req and call next middleware

        req.user=user;  //attach user to req
        next();




    } catch (error) {
        throw new ApiError(401,"Invalid Accesss Token!")
    }

})
