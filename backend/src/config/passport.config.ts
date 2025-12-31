import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model";
import Profile from "../models/profile.model";

// Helper function to generate consistent avatar URL based on gender and userId
const generateAvatarUrl = (
  gender: string | undefined,
  userId: string
): string => {
  const baseUrl = "https://avatar.iran.liara.run/public";
  const seed = userId; // Use userId as seed for consistency

  if (gender && gender.toLowerCase() === "female") {
    return `${baseUrl}?username=${seed}&sex=female`;
  } else if (gender && gender.toLowerCase() === "male") {
    return `${baseUrl}?username=${seed}&sex=male`;
  }
  // Default random avatar if gender is not specified
  return `${baseUrl}?username=${seed}`;
};

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

          // Create profile with avatar for new Google user
          const userId = (user._id as any).toString();
          const avatarUrl = generateAvatarUrl("other", userId);
          await Profile.create({
            userId: user._id,
            name: user.name,
            gender: "other",
            role: "student",
            skills: [],
            bio: "",
            languages: [],
            avatar: avatarUrl,
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
