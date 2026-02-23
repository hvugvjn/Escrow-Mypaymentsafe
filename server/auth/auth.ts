import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { sendOtpEmail } from "../email";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/request-otp", async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Invalid email" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (existing) {
      await db.update(users).set({
        currentOtp: otp,
        otpExpiresAt: expiresAt
      }).where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        email: email.toLowerCase(),
        currentOtp: otp,
        otpExpiresAt: expiresAt,
      });
    }

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent" });
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Missing email or otp" });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!user) return res.status(401).json({ message: "Invalid code or user not found" });

    if (user.currentOtp !== otp) {
      return res.status(401).json({ message: "Invalid code" });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(401).json({ message: "Code expired" });
    }

    await db.update(users).set({
      currentOtp: null,
      otpExpiresAt: null,
      updatedAt: new Date()
    }).where(eq(users.id, user.id));

    (req.session as any).userId = user.id;

    res.json({ message: "Authenticated successfully" });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionAny = req.session as any;

  if (!sessionAny.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Inject user into req object similar to how passport/replit auth did to prevent breaking other routes
  try {
    const [user] = await db.select().from(users).where(eq(users.id, sessionAny.userId));
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = {
      claims: { sub: user.id, email: user.email },
      ...user
    };
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
