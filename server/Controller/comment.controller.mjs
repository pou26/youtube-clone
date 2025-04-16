import { isValidRequestBody } from "../Middleware/validate.mjs";
import Video from "../Model/video.model.mjs";
import mongoose from 'mongoose';

export async function upsertComment(req, res, next) {
    try {
        if (!isValidRequestBody(req.body)) {
            return res.status(400).json({ status: false, message: "Request body cannot be empty." });
        }

        const { text, commentId } = req.body;
        const { videoId } = req.params;
        const userId = req.user.userId; // Get from authenticated user

        if (!text || !videoId || !userId) {
            return res.status(400).json({ status: false, message: "All fields (userId, videoId, text) are required!" });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: false, message: "Video not found." });
        }

        const comments = video.get("comments") || [];
        // console.log(JSON.stringify(comments));
        let id = "";
        // Create a new comment with an  _id
        if (!commentId) {
            const newComment = {
                _id: new mongoose.Types.ObjectId(),
                userId: userId,
                timestamp: new Date(),
                text: text
            };
            id = newComment._id;
            comments.push(newComment);
        } else {
            const commentIndex = comments.findIndex(comment =>
                comment._id == commentId && comment.userId == userId);
    
            if (commentIndex === -1) {
                return res.status(404).json({
                    status: false,
                    message: "Comment not found or you don't have permission to update this comment."
                });
            }
            id = comments[commentIndex]._id;
            // Update the comment text
            comments[commentIndex].text = text;
        }

        video.set("comments", comments);
        await video.save();

        res.status(201).json({ 
            status: true, 
            message: "Comment added successfully!", 
            data: { 
                video, 
                commentId: id // Return the commentId 
            } 
        });
    } catch(error) {
        console.log(error.message);
        console.log(error.stack);
        next(error);
    }
}
export async function updateComment(req, res, next) {
    try {
        const { videoId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user.userId;

        if (!videoId || !commentId || !text || !userId) {
            return res.status(400).json({
                status: false,
                message: "VideoId, commentId, text, and userId are required!"
            });
        }

        // Find the video document
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: false, message: "Video not found." });
        }

        const comments = video.comments || [];

        const commentIndex = comments.findIndex(comment => {
            // Check if _id and userId exist before calling toString()
            if (!comment?._id || !comment?.userId) return false;
            return comment._id.toString() === commentId && comment.userId.toString() === userId;
        });

        if (commentIndex === -1) {
            return res.status(404).json({
                status: false,
                message: "Comment not found or you don't have permission to update this comment."
            });
        }

        // Update the comment text
        comments[commentIndex].text = text;

        // Ensure changes are reflected in MongoDB
        video.comments = comments;  // Reassign the updated comments array
        await video.markModified("comments");  //  mark 'comments' as modified
        await video.save();  
        return res.status(200).json({
            status: true,
            message: "Comment updated successfully!",
            data: { updatedComment: comments[commentIndex] }
        });
    } catch (error) {
        next(error);
    }
}
// Delete comment
export async function deleteComment(req, res, next) {
    try {
        const { videoId, commentId } = req.params;
        const userId = req.user.userId;

        if (!videoId || !commentId || !userId) {
            return res.status(400).json({
                status: false,
                message: "VideoId, commentId, and userId are required!"
            });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: false, message: "Video not found." });
        }

        const comments = video.get("comments") || [];
        if (!Array.isArray(comments)) {
            return res.status(500).json({ status: false, message: "Invalid comments data." });
        }

        const commentIndex = comments.findIndex(comment =>
            comment?._id?.toString() === String(commentId) && comment?.userId?.toString() === String(userId)
        );

        if (commentIndex === -1) {
            return res.status(404).json({
                status: false,
                message: "Comment not found or you don't have permission to delete this comment."
            });
        }

        // Remove the comment
        comments.splice(commentIndex, 1);
        video.set("comments", comments);
        await video.save();

        return res.status(200).json({
            status: true,
            message: "Comment deleted successfully!",
            data: video
        });
    } catch (error) {
        next(error);
    }
}
// Get comments by videoId
export const getCommentsByVideoId = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json({ status: false, message: "Video ID is required!" });
        }
        // Fetch comments from MongoDB based on videoId
        const video = await Video.findById(videoId).lean();
        const comments = video.comments;
        res.status(200).json({ status: true, message: "Comments retrieved successfully!", data: comments });
    } catch (error) {
        next(error);
    }
};