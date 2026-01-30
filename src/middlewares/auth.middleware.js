import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse";
import jwt from 'jsonwebtoken';


const authMiddleware=async(req,res,next)=>{
    try {

        const refreshToken=req.cookies?.refreshToken;
        if(!refreshToken){
            throw new ApiError("refresh token is not available",400)
        }

        const user=await jwt.verify(refreshToken,process.env.JWT_SECRET_REFRESH);
        req.user=user._id;
        next();

    } catch (error) {
        throw new ApiError("Authentication failed",401,error);
    }

};


export default authMiddleware;