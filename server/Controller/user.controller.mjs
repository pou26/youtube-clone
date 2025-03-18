import userModel from "../Model/user.model.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {isValidPassword, isValidName, isValidRequestBody} from "../Middleware/validate.mjs";

// Create/Register a User
export async function upsertUser(req, res, next) {
    try {
        if (!isValidRequestBody(req.body)) {
            return res.status(400).json({ status: false, message: "Request body cannot be empty." });
        }
        
        const { userName, name, email, password } = req.body;
        
        if (!userName || !name || !email || !password) {
            return res.status(400).json({ status: false, message: "All fields (userName, name, email, password) are required!" });
        }
        
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "Email already in use." });
        }
        
        if (!isValidName(name)) {
            return res.status(400).json({ status: false, message: "Name must contain only letters and spaces." });
        }
        
        // if (!isValidPassword(password)) {
        //     return res.status(400).json({
        //         status: false,
        //         message: "Password must be 8-15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        //     });
        // }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new userModel({
            userName,
            name,
            email,
            password: hashedPassword,
            avatarUrl: null
        });
        
        const savedUser = await newUser.save();
        
        // Remove password from response
        const userResponse = { ...savedUser._doc };
        delete userResponse.password;
        
        res.status(201).json({ 
            status: true, 
            message: "User created successfully!", 
            data: userResponse 
        });
    } catch (error) {
        next(error);
    }
}

// Login User
// In your user controller
export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        
        // Find the user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: false, message: "Invalid email or password" });
        }
        
        // Verify password (assuming you're using bcrypt or similar)
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ status: false, message: "Invalid email or password" });
        }
        
        // Create token - make sure to include _id in the token payload
        const token = jwt.sign(
            { 
                _id: user._id.toString(),  // Make sure this is included
                email: user.email,
                name: user.name
            }, 
            "secretKey", 
            { expiresIn: "1d" }
        );
        
        res.status(200).json({
            status: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ status: false, message: "Login failed", error: error.message });
    }
}

// Get current user
export async function getCurrentUser(req, res, next) {
    try {
      const userId = req.user.userId; // authenticatedUser middleware
      
      const user = await userModel.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
      
      res.status(200).json({
        status: true,
        user: {
          _id: user._id,
          userName: user.userName,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }