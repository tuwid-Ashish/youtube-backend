import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoshema = new mongoose.Schema({
    videFile:{
        type:String,
        required:true,
        
    },
    thumbnail:{
        type:String,
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type: String,
        required: true,
        // lowercase: true,
        // trim: true,
    },
    deescription:{
        type: String,
        required: true,
        // lowercase: true,
        // trim: true,
    },
    duration:{
        type: Number,
        required: true,
        // lowercase: true,
    },
    views:{
        type: Number,
        required: true,
        default:0,
    },
    isPublished:{
        type: Boolean,
        required: true,
        // lowercase: true,

    }


},{timestamps:true})

mongoose.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoshema)