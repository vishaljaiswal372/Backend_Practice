import app from '../app.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import {Router} from 'express';
import {RegisterUser} from '../controllers/user.controller.js';
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






















export {userRouter};