import mongoose from "mongoose"

const channelSchema = new mongoose.Schema({
    channelId: {
        type: String,
        required: [true, "Channel ID is required"], 
        trim: true
    },
    channelName: {
        type: String,
        required: [true, "Channel name is required"], 
        trim: true
    },
    owner: {
        type: String,
        required: [true, "Owner is required"], 
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"], 
        trim: true
    },
    channelBanner: {
        type: String
    },
    channelThumbnail: {
        type: String
    },
    subscribers: {
        type: Number,
        required: true
    }
})

const channelModel = mongoose.model("channels", channelSchema);

export default channelModel;