import metaModel from "../Model/meta.model.mjs";

export async function getUserInteraction(req, res, next) {
  try {
    const { userId, videoId } = req.query;
    
    if (!userId || !videoId) {
      return res.status(400).json({ 
        status: false, 
        message: "User ID and Video ID are required" 
      });
    }
    
    const interaction = await metaModel.findOne({ 
      userId: userId, 
      videoId: videoId 
    });
    
    return res.status(200).json({
      status: true,
      interactionType: interaction ? interaction.type : null
    });
  } catch (error) {
    next(error);
  }
}