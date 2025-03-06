import mongoose from "mongoose"

const metaSchema = new mongoose.Schema({
    metaId: {
        type: String,
        required: [true, "Meta ID is required"], 
        trim: true
    },
    userId: {
        type: String,
        required: true
    },
    urlType: {
        type: String,
        required: [true, "URL type is required"], 
        trim: true
    },
    url: {
        type: String,
        required: [true, "URL is required"], 
        trim: true
    },
    createdAt: {
        type: Date,
        required: true
    }
})

const metaModel = mongoose.model("metas", metaSchema);

export default metaModel;