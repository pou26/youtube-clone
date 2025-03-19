import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../Model/user.model.mjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import express from "express";

const authRouter = express.Router();

// Express session middleware (needed for Passport)
authRouter.use(session({
  secret: 'cLz5IWaG7v0F9U8P1M_GtyfKiUFS',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
authRouter.use(passport.initialize());
authRouter.use(passport.session());

// Google OAuth 
passport.use(
  new GoogleStrategy(
    {
      clientID: "381776458282-2avqnjvhbf7rmpv0pgb1f6sle1evdh25.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:4000/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new userModel({
            userName: profile.displayName.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000),
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || null
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});

// Google Auth Routes
authRouter.get('/auth/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

authRouter.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:4000/login' }),
  (req, res) => {
    // Generate JWT token
    const user = req.user;
    const accessToken = jwt.sign(
      { userId: user.userId.toString(), email: user.email },
      "secretKey",
      { expiresIn: "24h" }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173`);
  }
);

export default authRouter;
