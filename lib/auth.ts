import { betterAuth } from "better-auth";
import { pool } from "@/lib/db";

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret) {
  throw new Error("Missing required environment variable BETTER_AUTH_SECRET");
}

const authBaseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL
        ? process.env.V0_RUNTIME_URL
        : "http://localhost:3000");

const trustedOrigins = [
  authBaseURL,
  ...(process.env.NEXT_PUBLIC_AUTH_URL
    ? [process.env.NEXT_PUBLIC_AUTH_URL]
    : []),
  ...(process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL] : []),
  ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
    : []),
].filter(Boolean);

const secureCookie = authBaseURL.startsWith("https");

export const auth = betterAuth({
  database: pool,
  baseURL: authBaseURL,
  secret: authSecret,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none" as const,
      secure: secureCookie,
    },
  },
});
