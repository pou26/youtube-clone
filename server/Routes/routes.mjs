import { getChannelById, updateSubscription, upsertChannel,getUserChannels } from "../Controller/channel.controller.mjs";
import { upsertComment,getCommentsByVideoId,updateComment,deleteComment  } from "../Controller/comment.controller.mjs";
import { upsertUser, loginUser,getCurrentUser  } from "../Controller/user.controller.mjs";
import {getVideo,getVideoById,upsertVideo,editOrUpdateVideo,getVideosByChannel, updateLikeDislike,deleteVideo} from "../Controller/video.controller.mjs";
import { channelUpload,videoAndThumbnailUpload ,multerErrorHandler } from "../Middleware/fileUpload.js";
import {getUserInteraction} from "../Controller/metaController.js";
import {authenticatedUser, authorization} from "../Middleware/auth.js"


export function routes(app) {
    // Users
    app.post("/user", upsertUser);
    app.post("/login", loginUser);
    app.get("/user/me", authenticatedUser, getCurrentUser);
    
    
    // Videos
    app.get("/videos", getVideo);
    // app.get("/video/:videoId/:userId", getVideoById);
    app.get("/video/:videoId", getVideoById);
    app.get("/videos/channel/:channelId", getVideosByChannel);
    app.post("/video/:channelId", authenticatedUser, videoAndThumbnailUpload, multerErrorHandler, upsertVideo);

    app.put("/video/:videoId", authenticatedUser, videoAndThumbnailUpload, multerErrorHandler, editOrUpdateVideo);
    app.delete("/video/:videoId", authenticatedUser, deleteVideo);
    
    // Comments
    app.post("/comment/:videoId", authenticatedUser, upsertComment);
    app.get("/comments/:videoId", getCommentsByVideoId);
    app.put("/comment/:videoId/:commentId", authenticatedUser, updateComment);
    app.delete("/comment/:videoId/:commentId", authenticatedUser, deleteComment);
    
    // Channels
    app.post("/channels/:userId", channelUpload, upsertChannel);
    app.get("/channel/:channelId/:userId", getChannelById);
    app.get("/user/:userId/channels", getUserChannels);
    app.put('/channels/:userId/:channelId', channelUpload, upsertChannel);
    
    
    // Like Dislike
    app.post("/opinion/:type", updateLikeDislike);
  
    app.get('/user-interaction', getUserInteraction);
    
    // Subscription
    app.post("/subscriptions/:type", updateSubscription);
}