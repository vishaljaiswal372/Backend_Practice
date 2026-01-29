class ApiError extends Error{
    constructor(message="something went wrong",statusCode,error=[]){
        super(message);
        this.error=error;
        this.statusCode=statusCode;
        this.success=false;
        this.message=message;
    }
}

export default ApiError;