import userModel from "../Model/user.model.mjs";
import { isValidObjectId } from "./validate.mjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();



// Constants from environment variables

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const VITE_BACKEND_URL = process.env.VITE_BACKEND_URL;

export function authenticatedUser(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        status: false, 
        message: "Authentication required. No authorization header provided." 
      });
    }
    
    // Extract token from Bearer header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        status: false, 
        message: "Authentication required. No token provided." 
      });
    }
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ 
            status: false, 
            message: "Session expired. Please login again." 
          });
        }
        return res.status(403).json({ 
          status: false, 
          message: "Invalid authentication token." 
        });
      }
      
      // Set decoded user info to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ 
      status: false, 
      message: "Authentication failed due to server error." 
    });
  }
}

export const authorization = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userIdFromToken = req.user?.userId; // Changed from req.user?._id to req.user?.userId
        
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
        if (findUser.userId.toString() !== userIdFromToken.toString()) { // Changed from findUser._id to findUser.userId
            return res.status(403).json({ status: false, message: "Unauthorized access!" });
        }
        
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(500).json({ status: false, message: "Authorization error", error: error.message });
    }
};