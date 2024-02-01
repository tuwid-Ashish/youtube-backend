import dotenv from "dotenv";
import { ConnectDB } from "./db/index.js";


dotenv.config({ path: "./env" });




ConnectDB();

// ;(async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("ERROR", (error)=>{
//             console.log("ERROR :",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listening on ${process.env.PORT}`);
//         })
//     } catch (error) {
//         console.log("ERROR :",error);
//         throw error
//     }
// })()
