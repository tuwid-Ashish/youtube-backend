import dotenv from "dotenv";
import { ConnectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./env" });




ConnectDB().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("the server is listening on port ", process.env.PORT);
    })
    app.get("/", (rq,res)=>{
        res.send("hello server side ")
    })
})

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
