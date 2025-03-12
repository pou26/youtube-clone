import mongoose from "mongoose"

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"], 
        required: true
    },
    channelId: {
        type: String,
        required: [true, "Channel ID is required"], 
        trim: true
    }
})

const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default subscriptionModel;