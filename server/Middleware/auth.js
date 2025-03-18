import userModel from "../Model/user.model.mjs";
import {isValidObjectId} from "./validate.mjs"; 
import jwt from "jsonwebtoken";

export function authenticatedUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("Auth header:", authHeader);
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log("Token extracted:", token ? "Token exists" : "No token");

    if (!token) {
        return res.status(401).json({ status: false, message: "Access Denied! No Token Provided." });
    }

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) {
            console.log("JWT verification error:", err);
            return res.status(403).json({ status: false, message: "Invalid Token" });
        }

        console.log("Decoded token:", decoded); 
        req.user = decoded; // Set user data from token
        next();
    });
}


export const authorization = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userIdFromToken = req.user?.userId;

        // Validate userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ status: false, message: "Invalid User ID in parameters." });
        }

        // Find user
        const findUser = await userModel.findById(userId);
        if (!findUser) {
            return res.status(404).json({ status: false, message: "User not found." });
        }

        // Check if the logged-in user has access
        if (findUser._id.toString() !== userIdFromToken) {
            return res.status(403).json({ status: false, message: "Unauthorized access!" });
        }

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

