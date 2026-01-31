import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const ObjectId=Schema.Types.ObjectId;

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    password:{
        unique:true,
        type:String,
        required:true,
    },
    avatar:{
        type:String,
    },
    coverImage:{
        type:String
    },
    watchHistory:[{
        type:ObjectId,
        ref:"video"
    }],
    refreshToken:{
        type:String
    },
},{timestamps:true});

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    console.log("changed password is saved in db",this.password);
    next();
});

userSchema.methods.isPasswordValid=async function (password){
    return await bcrypt.compare(password,this.password);
};

userSchema.methods.generateRefreshToken=async function(){
    return jwt.sign({
        _id:this._id,
    },process.env.JWT_SECRET_REFRESH,{expiresIn:process.env.JWT_REFRESH_EXPIRY});
};

userSchema.methods.generateAccessToken=async function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        password:this.password
    },process.env.JWT_SECRET_ACCESS, {expiresIn:process.env.JWT_ACCESS_EXPIRY});
};


const UserModel=mongoose.model("user",userSchema);

export default UserModel;