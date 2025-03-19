import subscriptionModel from "../Model/subscriptions.model.mjs";
import userModel from "../Model/user.model.mjs";
import channelModel from "../Model/channel.model.mjs";


export async function upsertChannel(req, res, next) {
    try {
      const { userId } = req.params;
      const { channelId } = req.params; // Get channelId from params for PUT request
      const { channelName, description, handle } = req.body;
  
      
      let channelBannerUrl = null;
      let channelThumbnailUrl = null;
      
      if (req.files) {
        //base URL from server config or environment
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
        
        // if bannerImage exists in the files
        if (req.files.channelBanner && req.files.channelBanner[0]) {
          const relativePath = req.files.channelBanner[0].path.replace(/\\/g, '/');
          channelBannerUrl = `${baseUrl}/${relativePath}`;
        }
        
        //if thumbnailImage exists in the files
        if (req.files.channelThumbnail && req.files.channelThumbnail[0]) {
          const relativePath = req.files.channelThumbnail[0].path.replace(/\\/g, '/');
          channelThumbnailUrl = `${baseUrl}/${relativePath}`;
        }
      }
      
      if (!channelId) {
        // Create new channel
        const newChannel = new channelModel({
          channelName: channelName || 'Unnamed Channel',
          description: description || '',
          handle: handle || `channel-${Date.now()}`,
          channelBannerUrl: channelBannerUrl,
          channelThumbnailUrl: channelThumbnailUrl,
          owner: userId,
          subscribers: 1
        });
        
        const savedChannel = await newChannel.save();
        
        // Self subscription
        const newSubscription = new subscriptionModel({
          userId: userId,
          channelId: savedChannel._id
        });
        
        await newSubscription.save();
        
        return res.status(201).json({ 
          status: true, 
          message: "Channel created successfully!", 
          data: savedChannel 
        });
      } else {
        // Update existing channel
        const existingChannel = await channelModel.findById(channelId);
        
        if (!existingChannel) {
          console.log("No DATA");
          return res.status(404).json({
            status: false,
            message: "Channel not found!"
          });
        }
        
        //if the user is the owner of the channel
        if (existingChannel.owner.toString() !== userId) {
          return res.status(403).json({
            status: false,
            message: "You don't have permission to edit this channel"
          });
        }
        
        // Update channel fields if provided
        if (channelName) existingChannel.set("channelName", channelName);
        if (description) existingChannel.set("description", description);
        if (handle) existingChannel.set("handle", handle);
        
        // Only update image URLs if files were uploaded
        if (channelBannerUrl) {
          existingChannel.set("channelBannerUrl", channelBannerUrl);
        }
        
        if (channelThumbnailUrl) {
          existingChannel.set("channelThumbnailUrl", channelThumbnailUrl);
        }
        
        const savedChannel = await existingChannel.save();
        
        return res.status(200).json({
          status: true, 
          message: "Channel updated successfully!", 
          data: savedChannel 
        });
      }
    } catch (error) {
        console.log("ERROR: " + error.message);
        console.log("ERROR: " + error.stack);
        next(error);
    }
  }

export async function getChannelById(req, res, next){
    try{
        const { channelId, userId } = req.params;
        const channel = await channelModel.findById(channelId).lean();
        if(!channel) {
            return res.status(404).json({msg:"No channel with this id"})
        }
        const user = await userModel.findById(channel.owner).lean();
        channel["ownerName"] = user.name;
        
        // Fix: add await here
        const subscription = await subscriptionModel.findOne({ channelId: channelId, userId: userId }).lean();
        if (subscription) {
            channel["userSubscribed"] = true;
        } else {
            channel["userSubscribed"] = false;
        }
        res.json(channel);
    }catch(error){
        next(error);
    }
}
// Add this new function to fetch all channels for a user
export async function getUserChannels(req, res, next) {
  try {
    const { userId } = req.params;
    
    // Find all channels where the user is the owner
    const userChannels = await channelModel.find({ owner: userId }).lean();
    
    if (!userChannels || userChannels.length === 0) {
      return res.json([]);
    }
    
    return res.json(userChannels);
  } catch (error) {
    console.error("Error fetching user channels:", error);
    next(error);
  }
}
export async function updateSubscription(req, res, next) {
    try {
        const { type } = req.params;
        const { userId, channelId } = req.body;
        const channel = await channelModel.findById(channelId);
        if (!channel || !channel._doc) {
            throw new Error("No channel found");
        }
        switch (type) {
            case "subscribe":
                const existingSubscription = await subscriptionModel.findOne({ channelId: channelId, userId: userId });
                if (!existingSubscription || !existingSubscription._doc) {
                    const newSubscription = new subscriptionModel({
                        userId: userId,
                        channelId: channelId
                    });
                    await newSubscription.save()
                }
                break;
            case "unsubscribe":
                subscriptionModel.deleteOne({ channelId: channelId, userId: userId });
                break;
            default:
                throw new Error("Invalid option");
        }

        const count = await subscriptionModel.countDocuments({ channelId: channelId, userId: userId });
        channel.set("subscribers", count);
        await channel.save();
        res.status(201).json({ status: true, message: "Successfully saved!" });
        return res
    } catch (error) {
        next(error);
    }
}