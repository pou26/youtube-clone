import mongoose from "mongoose"
const channelSchema = new mongoose.Schema({

    channelName: {
        type: String,
        required: [true, "Channel name is required"],
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'users',  
        // required: [true, "Owner is required"]
    },
    description: {
        type: String,
        trim: true
    },
    channelBannerUrl: {
        type: String
    },
    channelThumbnailUrl: {
        type: String
    },
    subscribers: {
        type: Number,
        default: 0
    }
})
const channelModel = mongoose.model("Channel", channelSchema);
export default channelModel;