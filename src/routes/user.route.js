import {Router} from 'express';
import {RegisterUser,loginUser} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js'; // upload is a middleware

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






















export {userRouter};