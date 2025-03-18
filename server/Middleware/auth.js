import userModel from "../Model/user.model.mjs";
import { isValidObjectId } from "./validate.mjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "secretKey"; // Consider using environment variables for this

export function authenticatedUser(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        console.log("Auth header:", authHeader);
        
        if (!authHeader) {
            return res.status(401).json({ status: false, message: "Access Denied! No Authorization Header Provided." });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: false, message: "Access Denied! No Token Provided." });
        }
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log("JWT verification error:", err);
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ status: false, message: "Token has expired. Please login again." });
                }
                return res.status(403).json({ status: false, message: "Invalid Token" });
            }
            
            console.log("Decoded token:", decoded);
            req.user = decoded; // Set user data from token
            next();
        });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ status: false, message: "Authentication error", error: error.message });
    }
}

export const authorization = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userIdFromToken = req.user?._id;
        
        if (!userIdFromToken) {
            return res.status(401).json({ status: false, message: "User not authenticated properly." });
        }
        
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
        if (findUser._id.toString() !== userIdFromToken.toString()) {
            return res.status(403).json({ status: false, message: "Unauthorized access!" });
        }
        
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(500).json({ status: false, message: "Authorization error", error: error.message });
    }
};