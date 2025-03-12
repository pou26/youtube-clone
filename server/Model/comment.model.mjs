import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    commentId: {
        type: String,
        required: [true, "Comment ID is required"], 
        trim: true
    },
    text: {
        type: String,
        required: [true, "Comment text is required"], 
        trim: true
    },
    videoId: {
        type: String,
        required: [true, "Video ID is required"], 
        trim: true
    },
    userId: {
        type: String,
        required: [true, "User ID is required"], 
        trim: true
    },
    timestamp: {
        type: Date,
        required: true
    }
})

const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;