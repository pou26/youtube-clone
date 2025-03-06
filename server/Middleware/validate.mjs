import mongoose from "mongoose";

// Function to check if a value is a valid string (not empty and contains only letters/spaces)
export function isValidName(value) {
    return typeof value === "string" && value.trim().length > 0 && /^[a-zA-Z\s]+$/.test(value);
}

// Function to validate passwords (8-15 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
export function isValidPassword(value) {
    return typeof value === "string" &&
        value.trim().length > 0 &&
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(value);
}

// Function to check if the request body is not empty
export function isValidRequestBody(requestBody) {
    return Object.keys(requestBody).length > 0;
}

// Function to validate MongoDB ObjectId
export function isValidObjectId(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
}

// Middleware to validate user input during user creation
export function validateUser(req, res, next) {
    const { firstName, lastName, hobby } = req.body;

    if (!firstName || !isValidName(firstName)) {
        return res.status(400).json({ msg: "Valid firstName is required" });
    }

    if (!lastName || !isValidName(lastName)) {
        return res.status(400).json({ msg: "Valid lastName is required" });
    }

    if (!hobby || !isValid(hobby)) {
        return res.status(400).json({ msg: "Hobby is required and must be a valid string" });
    }

    next(); 
}

// Middleware to validate user update requests (at least one field is required)
export function validateUpdateUser(req, res, next) {
    if (!isValidRequestBody(req.body)) {
        return res.status(400).json({ msg: "At least one field is required for updating" });
    }
    next();
}
