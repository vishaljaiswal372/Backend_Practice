import AsyncHandler from "../utils/AsyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { uploadInCloudinary } from "../utils/Cloudinary";
import UserModel from "../models/user.model";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';




const RegisterUser=async(req,res,next)=>{
    try {
        const {username,email,fullname,password}=req.body;
        //files are available in req.files
        if([username,email,fullname,password].some((field)=>!field)){
            throw new ApiError("All field are required to fill during registration",400);
        }

        const existedUser=await UserModel.findOne({
            $or:[{username},{email}]
        });

        if(existedUser){
            throw new ApiError("user is already existed",400);
        }

        const avatarFilePath=req.files?.avatar[0]?.path;
        const coverImageFilesPaths=req.files?.coverImage[0]?.path;

        if(!avatarFilePath){
            throw new ApiError("avatar path is not available",400);
        }

        const avatarUrl=uploadInCloudinary(avatarFilePath).url;
        const coverImageUrl=uploadInCloudinary(coverImageFilesPaths).url;
        const encryptedPassword=await bcrypt.hash(password,process.env.BCRYPT_SALT_ROUNDS);

        const user=UserModel.create({
            username,
            email,
            password,
            fullname,
            avatarUrl,
            coverImageUrl:coverImageUrl || "",
        });

        const createdUser=await UserModel.findById(user._id).select("-password -refreshToken");
        if(!createdUser){
            throw new ApiError("user is not registered something went wrong",400);
        }

        return res.status(200).json(new ApiResponse("user is registered successfully",createdUser,200));

    } catch (error) {
        console.log("error in registering user");
        throw new ApiError(error.message,error.statusCode || 500,error)
    }
};









export {RegisterUser};