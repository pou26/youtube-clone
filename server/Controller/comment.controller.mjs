import { isValidRequestBody } from "../Middleware/validate.mjs";
import commentModel from "../Model/comment.model.mjs";
import bcrypt from "bcrypt"; 

export async function upsertComment(req, res, next) {
    try {
        if (!isValidRequestBody(req.body)) {
            return res.status(400).json({ status: false, message: "Request body cannot be empty." });
        }
        const { commentId, text } = req.body;
        const { videoId, userId } = req.params;

        if (!text || !videoId || !userId) {
            return res.status(400).json({ status: false, message: "All fields (userId, videoId, text) are required!" });
        }
        // const commentHash = await bcrypt.hash(Date.now(), 6);

        if (!commentId) {
            const newComment = new commentModel({
                commentId: Date.now(),
                userId: userId,
                videoId: videoId,
                text: text,
                timestamp: new Date(), // Storing the hashed password
            });
            const savedComment = await newComment.save();
            res.status(201).json({ status: true, message: "Comment created successfully!", data: savedComment });
        } else {
            let existingComment = await commentModel.findOne({ commentId: commentId });
            if (!existingComment || !existingComment._doc) {
                return res.status(404).json({ status: false, message: "Comment not found." });
            }
            existingComment.set("text", text);
            existingComment.set("timestamp", new Date());
            const savedComment = await existingComment.save();
            res.status(201).json({ status: true, message: "Comment updated successfully!", data: savedComment });
        }
    } catch(error) {
        next(error); 
    }
}