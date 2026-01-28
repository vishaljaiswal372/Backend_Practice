class ApiResponse {
    constructor(message, data, statusCode){
        this.message = message;
        this.data=data;
        this.statusCode=statusCode;
        this.success=(status<400);
    }
}

//export {ApiResponse}; //import {ApiResponse} from './ApiResponse.js'
export default ApiResponse; //import ApiResponse from './ApiResponse.js'