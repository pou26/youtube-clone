import { upsertUser, loginUser } from "../Controller/user.controller.mjs";
import {getVideo,getVideoById} from "../Controller/video.controller.mjs";
// import {createCart,updateCart,deleteCart} from "../Controller/cart.controller.mjs";

// import { validateUser} from "../Middleware/validate.mjs";

// import {authenticatedUser,authorization} from "../Middleware/auth.js"

export function routes(app) {
    // Users
    app.post("/user", upsertUser);
    app.post("/login",loginUser);


    // Videos

    app.get("/videos", getVideo);
    app.get("/videos/:videoId", getVideoById);

    // //cart

    // app.post("/cart/:userId", authenticatedUser, authorization, createCart);
    // app.put("/cart/:cartid/:userId", authenticatedUser, authorization, updateCart);
    // app.delete("/cart/:cartid/:userId", authenticatedUser, authorization, deleteCart);
}
