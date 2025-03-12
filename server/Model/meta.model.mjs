import mongoose from "mongoose"

const metaSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"], 
        required: true
    },
    videoId: {
        type: String,
        required: [true, "Video ID is required"], 
        trim: true
    },
    type: {
        type: String,
        required: [true, "Like / Dislike is required"], 
        trim: true
    }
})

const metaModel = mongoose.model("Meta", metaSchema);

export default metaModel;