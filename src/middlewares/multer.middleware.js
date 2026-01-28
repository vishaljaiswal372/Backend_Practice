import multer from "multer"; // it is used for storing files,videos,images etc

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload=multer({storage,});

export default upload;