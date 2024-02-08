import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
export const registeruser = asyncHandler(async (req, res, next) => {
  // get the user details from frontend
  // validate -not empty
  // check if -user us already exist : username,email
  // check for image,avtar
  //upload them to cloudinary
  // create user object - create data entry in db
  // remove password & refresh token filed frm response
  //check for  user genrated
  // return respnse

  const { fullname, username, email, password } = req.body;
  console.log(`Email : ${email}`);
  if (
    [fullname, username, email, password].some(
      (fileds) => fileds?.trim() === "",
    )
  ) {
    throw new ApiError(400, "field can not be empty");
  }
  // more validation can be added
  const userexist = await User.findOne({
    $or: [email, username],
  });

  if (userexist) {
    throw new ApiError(
      409,
      "the user is already exist with this email or username",
    );
  }
  console.log(req.files);
  const avtarlocalpath = req.files?.avatar[0]?.path;
  const coverImagelocalpath = req.files?.coverImage[0]?.path;
  if (!avtarlocalpath) {
    throw new ApiError(
      500,
      "something went wrong on server side uploading file",
    );
  }

  const avataruploaded = await uploadOncloudinary(avtarlocalpath);
  const coverImageuploaded = await uploadOncloudinary(coverImagelocalpath);

  if (!avataruploaded) {
    throw new ApiError(
      500,
      "something went wrong on server side uploading file on db",
    );
  }

  const user = await User.create({
    fullname,
    avatar: avataruploaded.url,
    coverImage: coverImageuploaded?.url || "",
    email,
    password,
    username,
  });
  const checkeduser = await User.findById(user._id).select([
    "-password -refeshtoken",
  ]);

  if (!checkeduser) {
    throw new ApiError(
      500,
      "something went wrong on server side  while registering user",
    );
  }

  res
    .status(201)
    .json(new ApiResponse(200, checkeduser, "user is created succesfully"));
});
