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
        // Define isValidRequestBody function if it doesn't exist elsewhere
        const isValidRequestBody = (body) => {
            return body && Object.keys(body).length > 0;
        };
        
        if (!isValidRequestBody(req.body)) {
            return res.status(400).json({ status: false, message: "Request body cannot be empty." });
        }
        const { channelId } = req.params;
        const { 
            videoId, 
            videoUrl, 
            title, 
            description, 
            thumbnailUrl,
            category = "Other",  
            views = 0,           
            likes = 0,           
            dislikes = 0         
        } = req.body;
        
        if (!videoUrl || !title || !channelId) {
            return res.status(400).json({ status: false, message: "Video title and URL and Channel ID are required!" });
        }
        
        if (!videoId) {
            const newVideo = new Video({
                videoUrl: videoUrl,
                description: description,
                channelId: channelId,
                title: title,
                thumbnailUrl: thumbnailUrl,
                uploadDate: new Date(),
                category: category,  
                views: views,        
                likes: likes,        
                dislikes: dislikes   
            });
            const savedVideo = await newVideo.save();
            return res.status(201).json({ status: true, message: "Video created successfully!", data: savedVideo });
        } else {
            let existingVideo = await Video.findById(videoId);
            if (!existingVideo) {
                return res.status(404).json({ status: false, message: "Video not found." });
            }
            existingVideo.set("videoUrl", videoUrl);
            existingVideo.set("description", description);
            existingVideo.set("title", title);
            existingVideo.set("channelId", channelId);
            existingVideo.set("thumbnailUrl", thumbnailUrl);
            existingVideo.set("category", category);  
            const savedVideo = await existingVideo.save();
            res.status(201).json({ status: true, message: "Video updated successfully!", data: savedVideo });
        }
    } catch (error) {
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
      
      // Enhance videos with channel information if needed
      for (let video of videos) {
        // Calculate video duration if not already set
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
        
        // Check likes and dislikes count in one Query
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
      
      // First verify that the user has permission to delete this video
      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ status: false, message: "Video not found" });
      }
      
      const channel = await channelModel.findById(video.channelId);
      if (!channel || channel.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: false, message: "You don't have permission to delete this video" });
      }
      
      // Delete the video
      await Video.findByIdAndDelete(videoId);
      
      // Also remove related data (comments, likes, etc.)
      await commentModel.deleteMany({ videoId });
      await metaModel.deleteMany({ videoId });
      
      res.status(200).json({ status: true, message: "Video deleted successfully" });
    } catch (error) {
      next(error);
    }
  }