class ApiResponse{
    constructor(statuscode,data,message="Success"){
        this.statuscode = statuscode
        this.message = message
        this.success = statuscode
        this.data = data
    }
}