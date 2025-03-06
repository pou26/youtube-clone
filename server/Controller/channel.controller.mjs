import { isValidRequestBody } from "../Middleware/validate.mjs";
import channelModel from "../Models/channel.model.mjs";

export async function upsertChannel(req, res, next) {
    try {
        if (!isValidRequestBody(req.body)) {
            return res.status(400).json({ status: false, message: "Request body cannot be empty." });
        }
        const { userId } = req.params;
        const { channelId, channelName, description, channelBanner, channelThumbnail } = req.body;
        if (!channelName || !description) {
            return res.status(400).json({ status: false, message: "Channel name and description are required!" });
        }
        if (!channelId) {
            const newChannel = new channelModel({
                channelId: await bcrypt.hash(Date.now(), 6),
                channelName,
                description
            })
        }
    } catch (error) {
        
    }
}
