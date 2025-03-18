import channelModel from "../Model/channel.model.mjs";
import commentModel from "../Model/comment.model.mjs";
import userModel from "../Model/user.model.mjs";
import Video from "../Model/video.model.mjs";
import metaModel from "../Model/meta.model.mjs";


export async function getVideo(req, res, next) {
    try {
        const videos = await Video.find().lean();
        
        if (videos.length === 0) {
            return res.status(404).json({ msg: "No videos found" });
        }
        
        const channelIds = videos.map(video => video.channelId);
        const channels = await channelModel.find({ _id: { $in: channelIds } }).lean();
        
        const channelMap = {};
        channels.forEach(channel => {
            channelMap[channel._id.toString()] = channel;
        });
        
        const userIds = channels.map(channel => channel.owner);
        const users = await userModel.find({ _id: { $in: userIds } }).lean();
        
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user;
        });
        
        const enrichedVideos = videos.map(video => {
            const channel = channelMap[video.channelId.toString()];
            
            if (channel) {
                const user = userMap[channel.owner.toString()];
                
                return {
                    ...video,
                    channelName: channel.channelName,
                    uploader: user ? user.name : 'Unknown'
                };
            }
            
            return video;
        });
        
        res.json(enrichedVideos);
    } catch (error) {
        next(error);
    }
}

export async function upsertVideo(req, res, next) {
    try {
        // Check if a file was uploaded
        const videoFile = req.file;
        if (!videoFile) {
            return res.status(400).json({ status: false, message: "Video file is required!" });
        }

        const { channelId } = req.params;
        const { videoId, title, description, thumbnailUrl, category = "Other", channelName } = req.body;

        if (!title || !channelId) {
            return res.status(400).json({ status: false, message: "Title and Channel ID are required!" });
        }

        // Check if user owns the channel
        const channel = await channelModel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ status: false, message: "Channel not found." });
        }
        
        if (req.user && channel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to upload to this channel." });
        }

        // Create absolute URL for the video
        const videoUrl = `${req.protocol}://${req.get("host")}/uploads/${videoFile.filename}`;

        if (!videoId) {
            // Create new video
            const newVideo = new Video({
                videoUrl,
                title,
                description,
                channelId,
                thumbnailUrl,
                uploadDate: new Date(),
                category,
                channelName: channelName || ""
            });

            const savedVideo = await newVideo.save();
            return res.status(201).json({ status: true, message: "Video uploaded successfully!", data: savedVideo });
        } else {
            // Update existing video
            let existingVideo = await Video.findById(videoId);
            if (!existingVideo) {
                return res.status(404).json({ status: false, message: "Video not found." });
            }

            // Check if user owns the video
            const videoChannel = await channelModel.findById(existingVideo.channelId);
            if (!videoChannel || videoChannel.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ status: false, message: "You don't have permission to edit this video." });
            }

            // If updating, remove the old video file
            if (existingVideo.videoUrl) {
                try {
                    const oldFilePath = existingVideo.videoUrl.split('/uploads/')[1];
                    if (oldFilePath) {
                        const fullPath = path.join('uploads', oldFilePath);
                        // Delete the file if it exists
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    }
                } catch (error) {
                    console.error("Error deleting old video file:", error);
                    // Continue with the update even if file deletion fails
                }
            }

            existingVideo.videoUrl = videoUrl;
            existingVideo.title = title;
            existingVideo.description = description;
            existingVideo.thumbnailUrl = thumbnailUrl || existingVideo.thumbnailUrl;
            existingVideo.category = category;
            if (channelName) existingVideo.channelName = channelName;

            const savedVideo = await existingVideo.save();
            return res.status(200).json({ status: true, message: "Video updated successfully!", data: savedVideo });
        }
    } catch (error) {
        console.error("Error in upsertVideo:", error);
        next(error);
    }
}

export async function updateVideo(req, res, next) {
    try {
        const videoFile = req.file;
        // if (!videoFile) {
        //     return res.status(400).json({ status: false, message: "Video file is required!" });
        // }

        const { channelId } = req.params;
        let { videoId, title, description, thumbnailUrl, category = "Other", channelName, videoUrl } = req.body;

        if (!videoId) {
            return res.status(400).json({ status: false, message: "Video ID are required!" });
        }

        // Check if user owns the channel
        const channel = await channelModel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ status: false, message: "Channel not found." });
        }
        
        if (req.user && channel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to upload to this channel." });
        }

        // Create absolute URL for the video
        videoUrl = videoFile ? `${req.protocol}://${req.get("host")}/uploads/${videoFile.filename}` : videoUrl;
        if (!videoUrl) {
            throw new Error(`Invalid video URL for video ID: ${videoId}`);
        }

        // Update existing video
        let existingVideo = await Video.findById(videoId);
        if (!existingVideo) {
            return res.status(404).json({ status: false, message: "Video not found." });
        }

        // Check if user owns the video
        const videoChannel = await channelModel.findById(existingVideo.channelId);
        if (!videoChannel || videoChannel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to edit this video." });
        }

        // If updating, remove the old video file
        if (existingVideo.videoUrl) {
            try {
                const oldFilePath = existingVideo.videoUrl.split('/uploads/')[1];
                if (oldFilePath) {
                    const fullPath = path.join('uploads', oldFilePath);
                    // Delete the file if it exists
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            } catch (error) {
                console.error("Error deleting old video file:", error);
                // Continue with the update even if file deletion fails
            }
        }

        existingVideo.videoUrl = videoUrl;
        existingVideo.title = title;
        existingVideo.description = description;
        existingVideo.thumbnailUrl = thumbnailUrl || existingVideo.thumbnailUrl;
        existingVideo.category = category;
        if (channelName) existingVideo.channelName = channelName;

        const savedVideo = await existingVideo.save();
        return res.status(200).json({ status: true, message: "Video updated successfully!", data: savedVideo });
    } catch (error) {
        console.log("Error in add video: " + error.message);
        next(error);
    }
}

export async function getVideoById(req,res,next){
    try{
        const { videoId, userId } = req.params;
        const video = await Video.findById(videoId).lean();
        if(!video){
            return res.status(404).json({msg:"No Videos with this id"})
        }
        const comments = await commentModel.find({ videoId: videoId }).lean();
        const channel = await channelModel.findById(video.channelId).lean();
        const user = await userModel.findById(channel.owner).lean();
        video.channelName = channel.channelName;
        video.comments = comments;
        video.uploader = user.name;
        const existingMeta = await metaModel.findOne({ videoId: videoId, userId: userId }).lean();
        if (!existingMeta) {
            video.userLiked = false;
            video.userDisliked = false;
        } else if (existingMeta.type === "like") {
            video.userLiked = true;
            video.userDisliked = false;
        } else {
            video.userLiked = false;
            video.userDisliked = true;
        }
        res.json(video);
    }catch(error){
        next(error);
    }
}
export async function getVideosByChannel(req, res, next) {
    try {
      const { channelId } = req.params;
      
      const videos = await Video.find({ channelId: channelId }).lean();
      
      if (!videos || videos.length === 0) {
        return res.json([]);
      }
      
     
      for (let video of videos) {
        
        if (!video.duration) {
          video.duration = 0; // Set a default duration if not available
        }
        
        // Default values for missing fields
        video.views = video.views || 0;
        video.createdAt = video.uploadDate || video.createdAt || new Date();
      }
      
      res.json(videos);
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      next(error);
    }
  }
export async function updateLikeDislike(req, res, next) {
    try {
        const { type } = req.params;
        const { userId, videoId } = req.body;
        const existingMeta = await metaModel.findOne({ videoId: videoId, userId: userId });
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error("No video found");
        }
        switch (type) {
            case "like":
            case "dislike":
                if (!existingMeta) {
                    const newMeta = new metaModel({
                        userId: userId,
                        videoId: videoId,
                        type: type
                    });
                    await newMeta.save();
                } else {
                    existingMeta.set("type", type);
                    await existingMeta.save();
                }
                break;
            case "remove":
                await metaModel.deleteOne({ videoId: videoId, userId: userId });
                break;
            default:
                throw new Error("Invalid option");
        }
        
        // Check likes and dislikes count
        const counts = await metaModel.aggregate([
            { $match: { videoId: videoId } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        
        const likesCount = counts.find(count => count._id === "like")?.count || 0;
        const dislikesCount = counts.find(count => count._id === "dislike")?.count || 0;
        
        video.set("likes", likesCount);
        video.set("dislikes", dislikesCount);
        await video.save();
        
        res.status(201).json({ status: true, message: "Successfully saved!" });
    } catch (error) {
        next(error);
    }
}
export async function deleteVideo(req, res, next) {
    try {
        const { videoId } = req.params;
        
        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: false, message: "Video not found" });
        }
        
        // Verify that the user has permission to delete this video
        const channel = await channelModel.findById(video.channelId);
        if (!channel) {
            return res.status(404).json({ status: false, message: "Channel not found" });
        }
        
        // Check if req.user exists before accessing properties
        if (!req.user || !req.user._id) {
            return res.status(401).json({ status: false, message: "User not authenticated properly" });
        }
        
        // Check if the logged-in user is the owner of the channel
        if (channel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to delete this video" });
        }
        
        // Delete the video file
        if (video.videoUrl) {
            try {
                const videoPath = video.videoUrl.split('/uploads/')[1];
                if (videoPath) {
                    const fullPath = path.join('uploads', videoPath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            } catch (error) {
                console.error("Error deleting video file:", error);
                // Continue with deletion even if file removal fails
            }
        }
        
        // Delete the video from the database
        await Video.findByIdAndDelete(videoId);
        
        // Remove related data (comments, likes, etc.)
        await commentModel.deleteMany({ videoId });
        await metaModel.deleteMany({ videoId });
        
        res.status(200).json({ status: true, message: "Video deleted successfully" });
    } catch (error) {
        console.error("Error deleting video:", error);
        next(error);
    }
}

export async function editVideo(req, res, next) {
    try {
        const { videoId } = req.params;
        const { title, description, category, thumbnailUrl } = req.body;
        
        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: false, message: "Video not found" });
        }
        
        // Verify that the user has permission to edit this video
        const channel = await channelModel.findById(video.channelId);
        if (!channel) {
            return res.status(404).json({ status: false, message: "Channel not found" });
        }
        
        // Check if the logged-in user is the owner of the channel
        if (!req.user || channel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to edit this video" });
        }
        
        // Update the video
        if (title) video.title = title;
        if (description) video.description = description;
        if (category) video.category = category;
        if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;
        
        const updatedVideo = await video.save();
        
        res.status(200).json({ status: true, message: "Video updated successfully", data: updatedVideo });
    } catch (error) {
        console.error("Error editing video:", error);
        next(error);
    }
}