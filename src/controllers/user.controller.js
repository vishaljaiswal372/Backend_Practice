import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadInCloudinary } from "../utils/Cloudinary.js";
import UserModel from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateTokens=async(user)=>{
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
};


const RegisterUser=async(req,res)=>{
    try {
        const {username,email,fullname,password}=req.body;

        // //files are available in req.files

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
        const encryptedPassword=await bcrypt.hash(password,10);

        const user=await UserModel.create({
            username:username,
            email:email,
            password:encryptedPassword,
            fullname:fullname,
            avatar:avatarUrl,
            coverImage:coverImageUrl || "",
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

const loginUser=async(req,res)=>{
    const {username,password}=req.body;

    if(!username || !password){
        throw new ApiError("username and password are required for login",400);
    }

    const user=await UserModel.findOne({username});
    if(!user){
        throw new ApiError("user is not registered",400);
    }

    const isPasswordValid=user.isPasswordValid(password);

    if(!isPasswordValid){
        throw new ApiError("enter valid password",400);
    }

    const {accessToken,refreshToken}=await generateTokens(user);

    console.log("accessToken",accessToken);
    console.log("refreshToken",refreshToken);

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

    return res.status(200).
    cookie("accessToken",accessToken,optionsForAccess).
    cookie("refreshToken",refreshToken,optionsForRefresh).
    json(new ApiResponse("user is logged in successfully",{accessToken,refreshToken},200))
};


const changeUserPassword=async(req,res)=>{
    const userId=req.userId;
    const {oldPassword,newPassword}=req.body;
    const user=await UserModel.findById(userId);
    const isOldPasswordValid=await user.isPasswordValid(oldPassword);
    if(!isOldPasswordValid){
        throw new ApiResponse("please enter correct old password",null,400);
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse("password changed successfully",null,200));
};

const getUserDetails=async(req,res)=>{
    const userId=req.userId;
    const user=await UserModel.findById(userId).select("-refreshToken");
    if(!user){
        throw new ApiError("user not found",400);
    }
    return res.status(200).json(new ApiResponse("user details fetched successfully",user,200));
};

const logOutUser=async(req,res)=>{
    const userId=req.userId;
    const user=await UserModel.findById(userId);
    if(!user){
        throw new ApiError("user not found",400);
    }
    user.refreshToken="";
    await user.save({validateBeforeSave:false});
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
    return res.status(200).
    clearCookie("refreshToken",optionsForRefresh).
    clearCookie("accessToken",optionsForAccess).
    json(new ApiResponse("user logged out successfully",null,200));
};

const updateUserDetails=async(req,res)=>{
    const userId=req.userId;
    const user=await UserModel.findById(userId).select("-password -refreshToken -username");
    if(!user){
        throw new ApiError("user not found",400);
    }
    const {fullname,email}=req.body;
    user.fullname=fullname || user.fullname;
    user.email=email || user.email;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse("user details updated successfully",user,200));
};

const updateAvatar=async(req,res)=>{
    const userId=req.userId;
    const user=await UserModel.findById(userId).select("-password -refreshToken -username -fullname -email -coverImage");
    if(!user){
        throw new ApiError("user not found",400);
    }
    //const avatarFilePath=req.files?.avatar[0]?.path; // if you use upload.fields([{name:"avatar",maxCount:1}])
    const avatarFilePath=req.files[0].path; // if you use upload.array("avatar",1)
    if(!avatarFilePath){
        throw new ApiError("avatar path is not available",400);
    }
    const avatarUrl=uploadInCloudinary(avatarFilePath).url;
    user.avatar=avatarUrl;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse("avatar updated successfully",user,200));
};








export {
    RegisterUser,
    loginUser,
    changeUserPassword,
    generateTokens,
    getUserDetails,
    logOutUser,
    updateUserDetails,
    updateAvatar
};