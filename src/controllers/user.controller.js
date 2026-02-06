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

// const updateUserDetails = asyncHandler(async(req, res) => {
//     const {fullName, email} = req.body

//     if (!fullName || !email) {
//         throw new ApiError(400, "All fields are required")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 fullName,
//                 email: email
//             }
//         },
//         {new: true}
        
//     ).select("-password")

//     return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Account details updated successfully"))
// });

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

const updateCoverImage=async(req,res)=>{
    const userId=req.userId;
    const coverImageFilePath=req.files[0]?.path;
    if(!coverImageFilePath){
        throw new ApiError("cover image path is not available",400);
    }
    const coverImageUrl=uploadInCloudinary(coverImageFilePath).url;
    // user.coverImage=coverImageUrl;
    // await user.save({validateBeforeSave:false});
    const user=await UserModel.findByIdAndUpdate(
        userId,
        {
            $set:{
                coverImage:coverImageUrl
            }
        },
        {new:true},
    );
    return res.status(200).json(new ApiResponse("cover image updated successfully",user,200));
};



const getUserChannelProfile = async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await UserModel.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
};



const getWatchHistory = async(req, res) => {
    const user = await UserModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
};

export {
    RegisterUser,
    loginUser,
    changeUserPassword,
    generateTokens,
    getUserDetails,
    logOutUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};