import { isIP } from "node:net";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export type NodeEnvironment = "development" | "test" | "production";
export type TrustProxy = false | number | string[];

const isValidIpOrCidr = (address: string): boolean => {
  const [ip, prefix, extra] = address.split("/");
  if (!ip || extra !== undefined) return false;

  const version = isIP(ip);
  if (version === 0) return false;
  if (prefix === undefined) return true;
  if (!/^\d+$/.test(prefix)) return false;

  const bits = version === 4 ? 32 : 128;
  const prefixLength = Number(prefix);
  return (
    Number.isInteger(prefixLength) && prefixLength >= 0 && prefixLength <= bits
  );
};

const parseTrustProxy = (value?: string): TrustProxy => {
  if (!value || value.toLowerCase() === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().trim().optional(),
    JWT_SECRET: z.string().trim().optional(),
    JWT_EXPIRATION: z
      .string()
      .trim()
      .regex(
        /^(\d+)(?:ms|s|m|h|d|w|y)?$/i,
        "JWT_EXPIRATION must be a positive integer with an optional unit (ms, s, m, h, d, w, y)",
      )
      .default("7d"),
    REDIS_URL: z.string().trim().optional(),
    TRUST_PROXY: z.string().trim().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().trim().optional(),
    CLIENT_URL: z.string().trim().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().trim().optional(),
    CLOUDINARY_API_KEY: z.string().trim().optional(),
    CLOUDINARY_API_SECRET: z.string().trim().optional(),
    GOOGLE_CLIENT_ID: z.string().trim().optional(),
    GOOGLE_CLIENT_SECRET: z.string().trim().optional(),
    GOOGLE_CALLBACK_URL: z.string().trim().optional(),
    GITHUB_CLIENT_ID: z.string().trim().optional(),
    GITHUB_CLIENT_SECRET: z.string().trim().optional(),
    GITHUB_CALLBACK_URL: z.string().trim().optional(),
  })
  .superRefine((env, ctx) => {
    const isProd = env.NODE_ENV === "production";
    const requiredInProd = (field: string, value?: string) => {
      if (isProd && !value) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${field} is required in production`,
        });
      }
    };

    // 1. DATABASE_URL validation (supports mongodb://, mongodb+srv://, and replica set lists)
    if (!env.DATABASE_URL) {
      requiredInProd("DATABASE_URL");
    } else if (!/^mongodb(\+srv)?:\/\/.+/i.test(env.DATABASE_URL)) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL must start with mongodb:// or mongodb+srv://",
      });
    }

    // 2. JWT_SECRET validation
    if (!env.JWT_SECRET) {
      requiredInProd("JWT_SECRET");
    } else if (isProd) {
      if (env.JWT_SECRET.length < 32) {
        ctx.addIssue({
          code: "custom",
          path: ["JWT_SECRET"],
          message: "JWT_SECRET must be at least 32 characters in production",
        });
      }
      if (/your_|change.?me|replace.?with/i.test(env.JWT_SECRET)) {
        ctx.addIssue({
          code: "custom",
          path: ["JWT_SECRET"],
          message: "JWT_SECRET must not use placeholder text",
        });
      }
    }

    // 3. REDIS_URL validation
    if (!env.REDIS_URL) {
      requiredInProd("REDIS_URL");
    } else if (!/^rediss?:\/\/.+/i.test(env.REDIS_URL)) {
      ctx.addIssue({
        code: "custom",
        path: ["REDIS_URL"],
        message: "REDIS_URL must start with redis:// or rediss://",
      });
    }

    // 4. CLIENT_URL validation
    const clientUrl =
      env.CLIENT_URL || (isProd ? undefined : "http://localhost:3000");
    if (!clientUrl) {
      requiredInProd("CLIENT_URL");
    } else {
      try {
        const parsed = new URL(clientUrl);
        if (isProd && parsed.protocol !== "https:") {
          ctx.addIssue({
            code: "custom",
            path: ["CLIENT_URL"],
            message: "CLIENT_URL must use https:// in production",
          });
        }
        if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
          ctx.addIssue({
            code: "custom",
            path: ["CLIENT_URL"],
            message:
              "CLIENT_URL must be an origin without a path, query, or fragment",
          });
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["CLIENT_URL"],
          message: "CLIENT_URL must be a valid URL",
        });
      }
    }

    // 5. GOOGLE_GENERATIVE_AI_API_KEY in production
    if (isProd) {
      if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
        ctx.addIssue({
          code: "custom",
          path: ["GOOGLE_GENERATIVE_AI_API_KEY"],
          message: "GOOGLE_GENERATIVE_AI_API_KEY is required in production",
        });
      } else if (
        /your_|change.?me|replace.?with/i.test(env.GOOGLE_GENERATIVE_AI_API_KEY)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["GOOGLE_GENERATIVE_AI_API_KEY"],
          message: "GOOGLE_GENERATIVE_AI_API_KEY must not use placeholder text",
        });
      }
    }

    // 6. TRUST_PROXY validation
    if (env.TRUST_PROXY) {
      const tp = env.TRUST_PROXY.trim();
      if (tp.toLowerCase() === "true") {
        ctx.addIssue({
          code: "custom",
          path: ["TRUST_PROXY"],
          message:
            "TRUST_PROXY=true is not supported; use a numeric hop count (e.g. 1) or trusted IP/CIDR values",
        });
      } else if (tp.toLowerCase() !== "false" && !/^\d+$/.test(tp)) {
        const addresses = tp
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
        if (
          addresses.length === 0 ||
          addresses.some((a) => !isValidIpOrCidr(a))
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["TRUST_PROXY"],
            message:
              "TRUST_PROXY must be false, a non-negative hop count, or comma-separated IP/CIDR values",
          });
        }
      }
    }

    // 7. Co-dependent integration groups
    const checkGroup = (
      name: string,
      fields: (string | undefined)[],
      label: string,
    ) => {
      const provided = fields.filter(Boolean);
      if (provided.length > 0 && provided.length < fields.length) {
        ctx.addIssue({
          code: "custom",
          path: [name],
          message: `${label} requires all its variables to be set together`,
        });
      }
    };

    checkGroup(
      "GOOGLE_OAUTH",
      [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK_URL],
      "Google OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)",
    );

    checkGroup(
      "GITHUB_OAUTH",
      [env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, env.GITHUB_CALLBACK_URL],
      "GitHub OAuth (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL)",
    );

    checkGroup(
      "CLOUDINARY",
      [
        env.CLOUDINARY_CLOUD_NAME,
        env.CLOUDINARY_API_KEY,
        env.CLOUDINARY_API_SECRET,
      ],
      "Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)",
    );

    // 8. OAuth Callback URLs validity
    const checkCallbackUrl = (name: string, urlStr?: string) => {
      if (!urlStr) return;
      try {
        const u = new URL(urlStr);
        if (isProd && u.protocol !== "https:") {
          ctx.addIssue({
            code: "custom",
            path: [name],
            message: `${name} must use https:// in production`,
          });
        }
      } catch {
        ctx.addIssue({
          code: "custom",
          path: [name],
          message: `${name} must be a valid URL`,
        });
      }
    };

    checkCallbackUrl("GOOGLE_CALLBACK_URL", env.GOOGLE_CALLBACK_URL);
    checkCallbackUrl("GITHUB_CALLBACK_URL", env.GITHUB_CALLBACK_URL);
  });

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const errorLines = parseResult.error.issues.map(
    (issue) =>
      `- ${issue.path.length ? `${issue.path.join(".")}: ` : ""}${issue.message}`,
  );
  throw new Error(
    `Invalid environment configuration:\n${errorLines.join("\n")}`,
  );
}

const parsed = parseResult.data;

export const config = {
  port: parsed.PORT,
  nodeEnv: parsed.NODE_ENV,
  mongodbURI: parsed.DATABASE_URL ?? "",
  jwtSecret: parsed.JWT_SECRET ?? "",
  jwtExpiration: parsed.JWT_EXPIRATION,
  redisUrl: parsed.REDIS_URL ?? "redis://localhost:6379",
  trustProxy: parseTrustProxy(parsed.TRUST_PROXY),
  geminiApiKey: parsed.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  clientUrl: parsed.CLIENT_URL ?? "http://localhost:3000",
  cloudinaryCloudName: parsed.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: parsed.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: parsed.CLOUDINARY_API_SECRET ?? "",
  googleClientId: parsed.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: parsed.GOOGLE_CLIENT_SECRET ?? "",
  googleCallbackUrl: parsed.GOOGLE_CALLBACK_URL ?? "",
  githubClientId: parsed.GITHUB_CLIENT_ID ?? "",
  githubClientSecret: parsed.GITHUB_CLIENT_SECRET ?? "",
  githubCallbackUrl: parsed.GITHUB_CALLBACK_URL ?? "",
};
