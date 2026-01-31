import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';
import { generateTokens } from "../controllers/user.controller.js";
import UserModel from "../models/user.model.js";

const authMiddleware=async(req,res,next)=>{
    try {

        const refreshToken=req.cookies?.refreshToken;
        const accessToken=req.cookies?.accessToken;
        if(!refreshToken){
            throw new ApiError("refresh token is not available",400)
        }

        const user=await jwt.verify(refreshToken,process.env.JWT_SECRET_REFRESH);

        if(!user){
            throw new ApiError("Invalid refresh Token",400);
        }

        const userInDB=await UserModel.findById(user._id);

        if(!accessToken){
            const {newRefreshToken,newAccessToken}=await generateTokens(userInDB);

            const optionsForRefresh={
                httpOnly:true,
                secure:true,
                maxAge:15*24*60*60*1000,
            };

            const optionsForAccess={
                httpOnly:true,
                secure:true,
                maxAge:24*60*60*1000,
            };
            
            res.cookie("accessToken",newAccessToken,optionsForAccess).cookie("refreshToken",newRefreshToken,optionsForRefresh);
        }

        req.userId=user._id;
        next();

    } catch (error) {
        throw new ApiError("Authentication failed",401,error);
    }

};


export default authMiddleware;