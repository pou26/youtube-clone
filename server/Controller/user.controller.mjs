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
export async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ status: false, message: "Email and password are required!" });
        }
        
        // Find user by email
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ status: false, message: "Invalid email or password." });
        }
        
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(400).json({ status: false, message: "Invalid email or password." });
        }
        
        // Create user object without password
        const userObj = { 
            _id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl
        };
        
        // Generate JWT token
        const accessToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            "secretKey",
            { expiresIn: "24h" }
        );
        
        res.json({ 
            status: true, 
            message: "Login successful!", 
            accessToken,
            user: userObj
        });
    } catch (error) {
        next(error);
    }
}