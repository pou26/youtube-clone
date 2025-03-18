import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        trim: true
    },
    userName: {
        type: String,
        required: [true, "User name is required"], 
        trim: true
    },
    name: {
        type: String,
        required: [true, "Name is required"], 
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"], 
        trim: true
    },
    avatarUrl: {
        type: String
    },
    password:{
        type: String
    },
    googleId: {
        type: String,
        default: null
      }
})

const userModel = mongoose.model("users", userSchema);

export default userModel;