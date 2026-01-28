const AsyncHandler = async (requestHandler) => {
    Promise.resolve(requestHandler(req,res,next)).catch((e)=>{
        next(e);
    });
}

export default AsyncHandler;