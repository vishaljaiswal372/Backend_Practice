import {Router} from 'express';
import {RegisterUser,loginUser,changeUserPassword,getUserDetails,logOutUser,updateUserDetails} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js'; // upload is a middleware
import authMiddleware from '../middlewares/auth.middleware.js';

const userRouter=Router();

userRouter.post('/register', upload.fields([
    {
        name:"avatar",
        maxCount:1,
    },
    {
        name:"coverImage",
        maxCount:8,
    },
]) ,RegisterUser);

userRouter.post('/login',loginUser);
userRouter.get('/user-details',authMiddleware,getUserDetails);
userRouter.post('/logout',authMiddleware,logOutUser);
userRouter.patch('/change-password',authMiddleware,changeUserPassword);
userRouter.patch('/update-details',authMiddleware,updateUserDetails);


























export {userRouter};