import { relations } from "@bidoja/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { lastLoginMethod, twoFactor, phoneNumber, haveIBeenPwned } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({ connection: process.env["DATABASE_URL"]!, relations });

const auth = betterAuth({
  appName: "Lecrev",
  baseURL: process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000/api",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  user: {
    additionalFields: {
      isIdentityVerified: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      strikeCount: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
      sellingLimit: {
        type: "number",
        required: false,
      },
      status: {
        type: ["active", "suspended", "banned"],
        defaultValue: "active",
        input: false,
      },
      banType: {
        type: ["temporary", "permanent"],
        required: false,
      },
      banReason: {
        type: "string",
        required: false,
      },
      suspendedUntil: {
        type: "date",
        required: false,
      },
      role: {
        type: ["buyer", "seller", "admin"],
        defaultValue: "buyer",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    },
  },
  plugins: [
    twoFactor(),
    phoneNumber({
      sendOTP: async ({ phoneNumber: _phoneNumber, code }) => {
        console.log("OTP for %s: %s", _phoneNumber, code);
      },
      schema: {
        user: {
          fields: {
            phoneNumber: "phone",
            phoneNumberVerified: "isPhoneVerified",
          },
        },
      },
    }),
    haveIBeenPwned(),
    lastLoginMethod(),
  ],
});

export { auth };
