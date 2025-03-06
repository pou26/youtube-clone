import userModel from "../Model/user.model.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 
import {isValidPassword, isValidName, isValidRequestBody} from "../Middleware/validate.mjs"; 
import metaModel from "../Model/meta.model.mjs";


// ✅ Create a User
export async function upsertUser(req, res, next) {
    try {
        if (!isValidRequestBody(req.body)) {
            return res.status(400).json({ status: false, message: "Request body cannot be empty." });
        }
        const { userId, userName, name, email, avatarUrl, password } = req.body;

        if (!userName || !name || !email || !password) {
            return res.status(400).json({ status: false, message: "All fields (userName, email, password) are required!" });
        }

        if (!isValidName(name)) {
            return res.status(400).json({ status: false, message: "Name must contain only letters and spaces." });
        }

        // 🔍 Validate password format
        if (!isValidPassword(password)) {
            return res.status(400).json({
                status: false,
                message: "Password must be 8-15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        if (!userId) {
            const newUser = new userModel({
                userId: await bcrypt.hash(Date.now(), 6),
                userName,
                name,
                email,
                password: hashedPassword, // Storing the hashed password
            });

            if (avatarUrl) {
                const metaData = new metaModel({
                    metaId: await bcrypt.hash(Date.now(), 6),
                    userId: newUser.get("userId"),
                    urlType: "userAvatar",
                    url: avatarUrl,
                    createdAt: new Date().toISOString()
                });
                await metaData.save();
                newUser.set("avatarId", metaData.get("metaId"));
            }
            const savedUser = await newUser.save();
            res.status(201).json({ status: true, message: "User created successfully!", data: savedUser });
        } else {
            let existingUser = userModel.findOne({ userId: userId });
            if (!existingUser || !existingUser._doc) {
                return res.status(404).json({ status: false, message: "User not found." });
            }
            existingUser.set(userName, userName);
            existingUser.set(name, name);
            existingUser.set(email, email);
            let existingAvatar = metaModel.findOne({ userId: existingUser.get("userId"), urlType: "userAvatar", metaId: existingUser.get("avatarId") })
            if (avatarUrl) {
                if (!existingAvatar || !existingAvatar._doc) {
                    const metaData = new metaModel({
                        metaId: await bcrypt.hash(Date.now(), 6),
                        userId: newUser.get("userId"),
                        urlType: "userAvatar",
                        url: avatarUrl,
                        createdAt: new Date().toISOString()
                    });
                    await metaData.save();
                    existingUser.set("avatarId", metaData.get("metaId"));
                } else {
                    existingAvatar.set("url", avatarUrl);
                }
            } else {
                if (existingAvatar && existingAvatar._doc) {
                    metaModel.deleteOne({ userId: existingUser.get("userId"), urlType: "userAvatar", metaId: existingUser.get("avatarId") });
                }
            }
            const savedUser = await existingUser.save();
            res.status(201).json({ status: true, message: "User updated successfully!", data: savedUser });
        }
    } catch (error) {
        next(error); 
    }
}

// Login User (Authenticate)
export async function loginUser(req, res, next) {
    try {
        const { firstName, lastName, password } = req.body;

        if (!firstName || !lastName || !password) {
            return res.status(400).json({ status: false, message: "First Name, Last Name, and Password are required!" });
        }

        // Find user
        let user = await userModel.findOne({ firstName, lastName });
        if (!user) {
            return res.status(400).json({ status: false, message: "Login failed! Username is incorrect." });
        }

        if (!user.password) {
            return res.status(500).json({ status: false, message: "User's password is missing in the database." });
        }

        // Compare provided password with stored hashed password

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ status: false, message: "Login failed! Password is incorrect." });
        }

        // Generate JWT token

        const accessToken = jwt.sign(
            { userId: user._id.toString(), firstName: user.firstName, lastName: user.lastName }, 
            "secretKey", 
            { expiresIn: "1h" }
        );

        res.json({ status: true, message: "Login successful!", accessToken });
    } catch (error) {
        next(error);
    }
}

