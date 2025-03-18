import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        
        trim: true
    },
    videoUrl: {
        type: String,
        
    },
    channelId: {
        type: String,
        required: [true, "Channel ID is required"],
        trim: true
    },
    description: {
        type: String,
        
        trim: true
    },
    thumbnailUrl: {
        type: String
    },
    views: {
        type: Number,
        default: 0  // Set default value instead of required
    },
    likes: {
        type: Number,
        default: 0  // Set default value instead of required
    },
    dislikes: {
        type: Number,
        default: 0  // Set default value instead of required
    },
    uploadDate: {
        type: Date,
        
    },
    category: {  // Added category field to match your frontend
        type: String,
        default: "Other"
    },
    channelName:{
        type:String
    },
    comments: {
        type: Array
    }
}, { collection: "videos" })

const Video = mongoose.model("Video", videoSchema);

export default Video;