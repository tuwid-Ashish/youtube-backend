import { Router } from "express";
import { loginUser, logoutUser, registeruser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { AuthTokenverify } from "../middleware/Auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ])
    ,registeruser)

    router.route("/login").post(loginUser)
    router.route("/logout").post(AuthTokenverify ,logoutUser)

export default router