import {Router} from 'express';
import {RegisterUser,loginUser,changeUserPassword,getUserDetails,logOutUser,updateUserDetails,updateAvatar,updateCoverImage} from '../controllers/user.controller.js';
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


// userRouter.patch('/update-avatar',authMiddleware,upload.fields([{
//     name:"avatar",
//     maxCount:1,
// }]),updateAvatar); // => const avatarFilePath=req.files?.avatar[0]?.path;

userRouter.patch('/update-avatar',authMiddleware,
    upload.array("avatar",1),
updateAvatar); // => const avatarFilePath=req.files[0]?.path;

//userRouter.patch('/update-avatar',authMiddleware,upload.single("avatar"),updateAvatar); // => const avatarFilePath=req.file?.path;


userRouter.patch('/update-cover-image',authMiddleware,
    upload.array("coverImage",1),
updateCoverImage);






















export {userRouter};