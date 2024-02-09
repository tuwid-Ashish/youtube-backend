import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const AuthTokenverify = asyncHandler(async (req, res, next) => {
  try {
    const Token =
      req.cookies?.accesstoken ||
      req.header("Authorization")?.replce("Bearer ", " ");

    if (!Token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedtoken = jwt.verify(
      Token,
      process.env.JWT_ACCESS_TOKENT_SECRET,
    );
    const user = await User.findById(decodedtoken?._id).select(
      "-password -refreshtoken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
