import { getChannelById, updateSubscription, upsertChannel } from "../Controller/channel.controller.mjs";
import { upsertComment } from "../Controller/comment.controller.mjs";
import { upsertUser, loginUser } from "../Controller/user.controller.mjs";
import {getVideo,getVideoById,upsertVideo,getVideosByChannel, updateLikeDislike,deleteVideo} from "../Controller/video.controller.mjs";
import { channelUpload } from "../Middleware/fileUpload.js";
export function routes(app) {
    // Users
    app.post("/user", upsertUser);
    app.post("/login", loginUser);
    
    // Videos
    app.get("/videos", getVideo);
    // app.get("/video/:videoId/:userId", getVideoById);
    app.get("/video/:videoId", getVideoById);
    app.get("/videos/channel/:channelId", getVideosByChannel);
    app.post("/video/:channelId", upsertVideo); 
    app.delete("/video/:videoId", deleteVideo);
    
    // Comments
    app.post("/comment/:videoId/:userId", upsertComment);
    
    // Channels
    app.post("/channels/:userId", channelUpload, upsertChannel);
    app.get("/channel/:channelId/:userId", getChannelById);
    app.put('/channels/:userId/:channelId', channelUpload, upsertChannel);
    
    // Like Dislike
    app.post("/opinion/:type", updateLikeDislike);
    
    // Subscription
    app.post("/subscriptions/:type", updateSubscription);
}