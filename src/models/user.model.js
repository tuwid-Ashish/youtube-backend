import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bycrpt from "bcrypt";
// import { JsonWebTokenError } from "jsonwebtoken";
const userschema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [ true, "Password is reqiured"],
    },
    avatar: {
      type: String, // cloudinary url
    },
    coverImage: {
      type: String, // cloudinary url
    },
    refreshtoken: {
      type: String,
    },
    watchHistory:[ {
      type: Schema.Types.ObjectId,
      ref: "Video",
    }]

  },
  { timestamps: true },
);

userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bycrpt.hash(this.password, 10);
  next();
});

userschema.methods.isPasswordCorrect = async function(password){  
  
 return await bycrpt.compare(password, this.password) 

}
userschema.methods.Jwt_access_token = function(){
  return jwt.sign(
    {
      _id : this._id,
      fullname :this.fullname,
      email:this.email,
      username:this.username,
    },
    process.env.JWT_ACCESS_TOKENT_SECRET,
    {
      expiresIn:process.env.JWT_ACCESS_TOKENT_EXPIREY_DATE
    }
    )
}
userschema.methods.Jwt_refresh_token = function(){
  return jwt.sign(
    {
       _id : this._id,
    },
    process.env.JWT_REFRESH_TOKENT_SECRET,
   {
    expiresIn:process.env.JWT_REFRESH_TOKENT_EXPIREY_DATE
   }
  )
}
export const User = mongoose.model("User", userschema);
