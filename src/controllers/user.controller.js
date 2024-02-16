import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/multer.middleware.js";
const options = {
  httpOnly: true,
  secure: true,
};

const genrateAccesandRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    console.log(user);
    const refreshtoken = user.Jwt_refresh_token();
    console.log("at refresh");
    const accesstoken = user.Jwt_access_token();
    console.log("at access");
    user.refreshtoken = refreshtoken;
    const updateduser = await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken, updateduser };
  } catch (errors) {
    console.log(errors);
    throw new ApiError(
      500,
      "problem accour in genrating access & refresh token",
    );
  }
};

const registeruser = asyncHandler(async (req, res, next) => {
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
  console.log("My password field is : ", password, fullname, username);

  const userexist = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (userexist) {
    throw new ApiError(
      409,
      "the user is already exist with this email or username",
    );
  }
  console.log("this is just req files checking", req.files);
  const avtarlocalpath = req.files?.avtar[0]?.path;
  // const coverImagelocalpath = req.files?.coverImage[0]?.path;
  let coverImagelocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagelocalpath = req.files.coverImage[0].path;
  }

  if (!avtarlocalpath) {
    throw new ApiError(
      500,
      "something went wrong on server side uploading file",
    );
  }

  const avataruploaded = await uploadOncloudinary(avtarlocalpath);
  const CoverImageuploaded = await uploadOncloudinary(coverImagelocalpath);

  if (!avataruploaded) {
    throw new ApiError(
      500,
      "something went wrong on server side uploading file on db",
    );
  }

  const user = await User.create({
    username,
    email,
    fullname,
    password,
    avatar: avataruploaded.url,
    coverImage: CoverImageuploaded?.url || "",
  });
  const checkeduser = await User.findById(user._id).select(
    "-password -refeshtoken",
  );

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

const loginUser = asyncHandler(async (req, res, next) => {
  //get data from frontend
  //check for empty fileds
  //check for email or username exist in db
  //compare the password string,
  // access and refresh token generation
  // send cookies
  // succes response

  const { email, username, password } = req.body;

  console.log(Boolean(email), Boolean(username));
  if (!username && !email) {
    console.log(Boolean(email), Boolean(username));
    throw new ApiError(400, "email field is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username|| email)) {
  //     throw new ApiError(400, "username or email is required")
  // }
  console.log("the value of username :", username);

  const userexist = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!userexist) {
    throw new ApiError(401, "user not found");
  }

  const isPasswordvalid = await userexist.isPasswordCorrect(password);

  if (!isPasswordvalid) {
    throw new ApiError(404, "enter the correct password ");
  }

  const { accesstoken, refreshtoken, updateduser } =
    await genrateAccesandRefreshToken(userexist._id);

  const loggedinUser = {
    _id: updateduser._id,
    username: updateduser.username,
    email: updateduser.email,
    fullname: updateduser.fullname,
    // password: null,
    avatar: updateduser.avatar,
    coverImage: updateduser.coverImage,
    watchHistory: [],
    // refreshtoken: null,
  };
  // const loggedinUser = await User.findById(updateduser._id).select("-password -refreshtoken")
  //  const loggedinUser = {...userexist, password:null, refreshtoken: null}
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: accesstoken,
          refreshtoken,
          loggedinUser,
        },
        "User logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshaccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshtoken =
      req.cookies.refreshtoken || req.body.refreshtoken;

    if (!incomingRefreshtoken) {
      throw new ApiError(401, "unauthorized request");
    }
    const decodedtoken = jwt.verify(
      incomingRefreshtoken,
      process.env.JWT_REFRESH_TOKENT_SECRET,
    );

    if (!decodedtoken) {
      throw new ApiError(401, "invalid refresh token");
    }
    const user = await User.findById(decodedtoken?._id);
    if (!user) {
      throw new ApiError(401, "user not found");
    }

    const dbrefreshtoken = user?.refreshtoken;

    if (dbrefreshtoken !== decodedtoken) {
      throw new ApiError(401, "invalid refresh token");
    }
    const { NewRefreshtoken, accesstoken } = await genrateAccesandRefreshToken(
      user._id,
    );

    res
      .status(200)
      .cookies("refreshtoken", NewRefreshtoken, options)
      .cookies("accesstoken", accesstoken, options)
      .json(
        new ApiResponse(
          200,
          {
            accesstoken,
            refreshtoken: NewRefreshtoken,
          },
          "Acess token refresh",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

const UpdatePassword = asyncHandler(async (req, res) => {
  const { oldPaaword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const Passwordchecked = await user.isPasswordCorrect(oldPaaword);
  if (!Passwordchecked) {
    throw new ApiError(401, "password is not correct");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is changed sucessfully"));
});

const updateAccountdetails = asyncHandler(async (req, res) => {
  const { fullname, email, username } = req.body;

  if (!(fullname && email)) {
    throw new ApiError(401, "fullname and email is required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email},
    },
    {
      new: true,
    },
  ).select("-password");

  return res.status(200).json(
    new ApiResponse(200,user, "the user fullname and email has been updated")
  )
})

const updateAvatar = asyncHandler(async(req,res)=>{
  const AvatarLocalPath = req.file.path

  
  if (!AvatarLocalPath) {
    throw new ApiError(401,"the avatar image is missing")
  }
  const avatoruploaded =  await uploadOncloudinary(AvatarLocalPath)
  if (!avatoruploaded.url) {
    throw new ApiError(401,"Error while uploading avatar on cloudinary")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {avatar: avatoruploaded?.url},
    },
    {
      new: true,
    },
  ).select("-password");
  return res.status(200).json(
    new ApiResponse(200,user, "the user avatar has been updated")
  )
})
const updateCoverImage = asyncHandler(async(req,res)=>{
  const CoverImageLocalPath = req.file.path

  
  if (!CoverImageLocalPath) {
    throw new ApiError(401,"the coverimageimage is missing")
  }
  const CoverImageuploaded =  await uploadOncloudinary(CoverImageLocalPath)
  if (!CoverImageuploaded.url) {
    throw new ApiError(401,"Error while uploading CoverImage on cloudinary")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {coverImage: CoverImageuploaded?.url},
    },
    {
      new: true,
    },
  ).select("-password");
  return res.status(200).json(
    new ApiResponse(200,user, "the user coverImage has been updated")
  )
})
;
export { registeruser, loginUser, logoutUser, refreshaccessToken,updateAccountdetails,UpdatePassword,updateCoverImage,updateAvatar };
