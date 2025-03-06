import Video from "../Model/video.model.mjs";


export async function getVideo(req,res,next){
    try{
        const videos= await Video.find();

        if(videos.length===0){
            return res.status(404).json({msg:"No videos found"})
        }
        res.json(videos);
    }catch(error){
        next(error);
    }
};


export async function getVideoById(req,res,next){
    try{
        const { videoId } = req.params;

        const video= await Video.findById(videoId);

    //     if (!isValidObjectId(productId)) {
    //       return res.status(400).json({ msg: "Invalid product ID" });
    //   }

        if(!video){
            return res.status(404).json({msg:"No Videos with this id"})
        }

        res.json(video);

    }catch(error){
        next(error);
    }
  }