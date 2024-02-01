import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const ConnectDB= async ()=>{
    try {
        console.log(process.env.MONGOBD_URL)
        const connectionInstance = await mongoose.connect(`${process.env.MONGOBD_URL}/${DB_NAME}`)
        console.log(`\n Mongodb connected !! DB host name : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongodb connecton failed", error);
        process.exit(1)
        
    }
}