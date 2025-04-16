// auth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import session from "express-session";
import express from "express";    // maintain session state across requests.
// import dotenv from "dotenv";
import userModel from "../Model/user.model.mjs";

// Load environment variables
// dotenv.config();

const JWT_SECRET = "cLz5IWaG7v0F9U8P1M_GtyfKiUFS" ;
const GOOGLE_CLIENT_ID = "381776458282-2avqnjvhbf7rmpv0pgb1f6sle1evdh25.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const FRONTEND_URL =  "http://localhost:5173";
const BACKEND_URL = "http://localhost:4000";

const authRouter = express.Router();

// Express session middleware (needed for Passport)
authRouter.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', //only allows cookies over HTTPS in production.
    httpOnly: true,  //makes cookies inaccessible from JS (for security).
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport(Middleware for authentication)
authRouter.use(passport.initialize());
authRouter.use(passport.session());  //Enables persistent login sessions.

// Google OAuth Strategy Configures Google OAuth.
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/callback`,  //Redirects to Google for login, then returns them to /auth/google/callback.
      scope: ["profile", "email"],
    },

    //After Google login, this callback runs.
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find existing user or create a new one
        let user = await userModel.findOne({ email: profile.emails[0].value });

        if (!user) {
          // Create new user
          const username = profile.displayName.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000);  //from the user's Google profile name removes whitespace and create random name
          
          user = new userModel({
            userName: username,
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || null
          });
          
          await user.save();
          

        } else if (!user.googleId) {
          // If user exists but doesn't have googleId 
          user.googleId = profile.id;
          
          
          if (!user.avatarUrl && profile.photos?.[0]?.value) {
            user.avatarUrl = profile.photos[0].value;
          }
          
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, null);
      }
    }
  )
);

// User serialization/deserialization for session management
//Stores the user ID in session.
passport.serializeUser((user, done) => {
  done(null, user._id);
});


//Retrieves full user from DB using the ID saved in the session.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Generate JWT token helper function
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id.toString(), 
      email: user.email 
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Google Auth Routes
authRouter.get('/auth/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

authRouter.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed` 
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      // Generate JWT token
      const accessToken = jwt.sign(
                  { userId: user._id.toString(), email: user.email },
                  "secretKey",
                  { expiresIn: "24h" }
              );
      // Create a user object
      const userData = {
        _id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        defaultChannel: user.defaultChannel
      };
      
      // Encode user data for URL transmission
      const encodedUserData = encodeURIComponent(JSON.stringify(userData));
      
      // Redirect to frontend with token and user data
      res.redirect(`${FRONTEND_URL}?token=${accessToken}&userData=${encodedUserData}`);
    } catch (error) {
      console.error(`OAuth callback error: ${error.message}\n${error.stack}`);
      res.redirect(`${FRONTEND_URL}/login?error=authentication_error`);
    }
  }
);


export default authRouter;