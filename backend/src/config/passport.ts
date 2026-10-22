import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import authService from "../services/auth.service";

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        const user = await authService.findOrCreateSocialUser({
          provider: "google",
          providerId: profile.id,
          email,
          firstName: profile.name?.givenName || "Traveler",
          lastName: profile.name?.familyName || "User",
          avatarUrl: profile.photos?.[0]?.value,
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@users.noreply.github.com`;

        const nameParts = (profile.displayName || profile.username || "").split(" ");
        const firstName = nameParts[0] || "Traveler";
        const lastName = nameParts.slice(1).join(" ") || "User";

        const user = await authService.findOrCreateSocialUser({
          provider: "github",
          providerId: profile.id,
          email,
          firstName,
          lastName,
          avatarUrl: profile.photos?.[0]?.value,
        });

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;
