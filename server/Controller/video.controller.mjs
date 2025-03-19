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
        console.log(`Error: ${error.message}/n${error.stack}`)
        next(error);
    }
}

export async function upsertVideo(req, res, next) {
    try {
        // Check if a file was uploaded
        console.log(JSON.stringify(req.files));
        const videoFile = req.files.videoFile[0];
        if (!videoFile) {
            return res.status(400).json({ status: false, message: "Video file is required!" });
        }
        const thumbnailFile = req.files.thumbnailFile && req.files.thumbnailFile.length ? req.files.thumbnailFile[0] : null;
        if (!thumbnailFile) {
            return res.status(400).json({ status: false, message: "Thumbnail is required!" });
        }
        const { channelId } = req.params;
        const { videoId, title, description, category = "Other", channelName } = req.body;

        if (!title || !channelId) {
            return res.status(400).json({ status: false, message: "Title and Channel ID are required!" });
        }

        // Check if user owns the channel
        const channel = await channelModel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ status: false, message: "Channel not found." });
        }
        
        if (req.user && channel.owner.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to upload to this channel." });
        }

        // Create absolute URL for the video
        const videoUrl = `${req.protocol}://${req.get("host")}/uploads/${videoFile.filename}`;
        const thumbnailUrl = `${req.protocol}://${req.get("host")}/uploads/${thumbnailFile.filename}`;

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
            if (!videoChannel || videoChannel.owner.toString() !== req.user.userId.toString()) {
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
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ status: false, message: "User not authenticated properly" });
        }
        
        // Check if the logged-in user is the owner of the channel
        if (channel.owner.toString() !== req.user.userId.toString()) {
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

export async function editOrUpdateVideo(req, res, next) {
    try {
        const { videoId } = req.params;
        console.log(videoId);
        const { title, description, category, thumbnailUrl, channelName, videoUrl } = req.body;
        const videoFile = req.file;

        // Ensure authenticated user exists
        if (!req.user) {
            return res.status(401).json({ status: false, message: "Unauthorized: User not found" });
        }

        // Find video
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ status: false, message: "Video not found" });
        }

        // Find channel associated with video
        const channel = await channelModel.findById(video.channelId);
        if (!channel || !channel.owner) {
            return res.status(404).json({ status: false, message: "Channel not found or owner missing" });
        }

        // Check if the user owns the channel
        if (channel.owner.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ status: false, message: "You don't have permission to edit this video" });
        }

        // Handle video file update
        if (videoFile) {
            const newVideoUrl = `${req.protocol}://${req.get("host")}/uploads/${videoFile.filename}`;

            // Delete old video file if it exists
            if (video.videoUrl) {
                try {
                    const oldFilePath = video.videoUrl.split('/uploads/')[1];
                    if (oldFilePath) {
                        const fullPath = path.join('uploads', oldFilePath);
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    }
                } catch (error) {
                    console.error("Error deleting old video file:", error);
                }
            }
            video.videoUrl = newVideoUrl;
        }

        // Update fields if provided
        if (title) video.title = title;
        if (description) video.description = description;
        if (category) video.category = category;
        if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;
        if (channelName) video.channelName = channelName;

        const updatedVideo = await video.save();
        res.status(200).json({ status: true, message: "Video updated successfully", data: updatedVideo });
    } catch (error) {
        console.error("Error editing/updating video:", error);
        next(error);
    }
}


