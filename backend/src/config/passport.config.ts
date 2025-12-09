import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account has no email"));

        // 🟩 Try finding the user by email OR googleId (in case of re-login)
        let user = await User.findOne({
          $or: [{ email }, { googleId: profile.id }],
        });

        if (!user) {
          // 🟢 Create new user if not found
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id, // ✅ link Google account
            avatarUrl: profile.photos?.[0]?.value || "",
          });
        } else if (!user.googleId) {
          // 🟡 If existing local account signs in with Google, link Google ID
          user.googleId = profile.id;
          await user.save();
        }

        // ✅ Pass the user to next middleware
        done(null, user ? (user.toObject() as Express.User) : false);
      } catch (err) {
        console.error("Google OAuth Error:", err);
        done(err, undefined);
      }
    }
  )
);

export default passport;
