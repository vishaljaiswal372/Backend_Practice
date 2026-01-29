import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const ObjectId=Schema.Types.ObjectId;

const userSchema=new Schema({
    username:{
        type:string,
        required:true,
        unique:true,
    },
    email:{
        type:string,
        required:true,
        unique:true,
    },
    fullName:{
        type:string,
        required:true,
    },
    password:{
        unique:true,
        type:string,
        required:true,
    },
    avatar:{
        type:string,
        required:true
    },
    coverImage:{
        type:string
    },
    watchHistory:[{
        type:ObjectId,
        ref:"video"
    }],
    refreshToken:{
        type:string
    },
    accessToken:{
        type:string
    }
},{timestamps:true});

userSchema.pre("save",async (next)=>{
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,process.env.BCRYPT_SALT_ROUNDS);
    console.log("changed password is saved in db",this.password);
    next();
});

userSchema.methods.isPasswordValid=async (password)=>{
    return await bcrypt.compare(password,this.password);
};

userSchema.methods.generateRefreshToken=async()=>{
    return jwt.sign({
        _id:this._id,
    },process.env.JWT_SECRET_REFRESH,{expiresIn:process.env.JWT_REFRESH_EXPIRY});
};

userSchema.methods.generateAccessToken=async()=>{
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        password:this.password
    },process.env.JWT_SECRET_ACCESS, {expiresIn:process.env.JWT_ACCESS_EXPIRY});
};


const UserModel=mongoose.model("user",userSchema);

export default UserModel;