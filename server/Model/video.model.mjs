import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: [true, "Video ID is required"], 
        trim: true
    },
    title: {
        type: String,
        required: [true, "Title is required"], 
        trim: true
    },
    channelId: {
        type: String,
        required: [true, "Channel ID is required"], 
        trim: true
    },
    uploader: {
        type: String,
        required: [true, "Uploader detail is required"], 
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"], 
        trim: true
    },
    thumbnail: {
        type: String
    },
    views: {
        type: Number,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    dislikes: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        required: true
    }
},{ collection: "videos" })

const Video = mongoose.model("Video", videoSchema);

export default Video;