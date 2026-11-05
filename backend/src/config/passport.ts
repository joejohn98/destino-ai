import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import type { VerifyCallback } from "passport-oauth2";
import type { Profile as GitHubProfile } from "passport-github2";
import authService from "../services/auth.service";
import { config } from "./config";

// Google Strategy
if (config.googleClientId && config.googleClientSecret && config.googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: config.googleCallbackUrl,
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
          return done(
            err instanceof Error ? err : new Error("Google OAuth failed"),
            undefined,
          );
        }
      },
    ),
  );
} else {
  console.info("Google OAuth strategy disabled: missing credentials.");
}

// GitHub Strategy
if (config.githubClientId && config.githubClientSecret && config.githubCallbackUrl) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.githubClientId,
        clientSecret: config.githubClientSecret,
        callbackURL: config.githubCallbackUrl,
        scope: ["user:email"],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GitHubProfile,
        done: VerifyCallback,
      ) => {
        try {
          const email =
            profile.emails?.[0]?.value ||
            `${profile.username}@users.noreply.github.com`;

          const nameParts = (profile.displayName || profile.username || "").split(
            " ",
          );
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
          return done(
            err instanceof Error ? err : new Error("GitHub OAuth failed"),
            undefined,
          );
        }
      },
    ),
  );
} else {
  console.info("GitHub OAuth strategy disabled: missing credentials.");
}

export default passport;
