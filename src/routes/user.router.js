import { Router } from "express";
import {
  GetCurrentUser,
  UpdatePassword,
  getUserChannelProfile,
  getUserWatchHistory,
  loginUser,
  logoutUser,
  refreshaccessToken,
  registeruser,
  updateAccountdetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { AuthTokenverify } from "../middleware/Auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avtar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registeruser,
);

router.route("/login").post(loginUser);
router.route("/logout").post(AuthTokenverify, logoutUser);
router.route("/refresh-token").post(refreshaccessToken);
router.route("change-password").post(AuthTokenverify, UpdatePassword);
router.route("/current-user").get(AuthTokenverify, GetCurrentUser);
router.route("/update-account").patch(AuthTokenverify, updateAccountdetails);
router.route("/avatar").patch(AuthTokenverify, upload.single("avatar"), updateAvatar);
router.route("/coverImage").patch(AuthTokenverify, upload.single("coverImage"), updateCoverImage);
router.route("/channel/:username").post(AuthTokenverify,getUserChannelProfile)
router.route("/history").get(AuthTokenverify,getUserWatchHistory)
export default router;
