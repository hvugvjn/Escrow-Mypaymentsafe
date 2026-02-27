import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { db } from "../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { sendOtpEmail } from "../email";
import bcrypt from "bcryptjs";

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

  // ── Check if email already exists (new vs returning user) ──────────────────
  app.post("/api/auth/check-email", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    res.json({ exists: !!user, hasPassword: !!(user?.passwordHash) });
  });

  // ── REGISTER — new user: email + password + confirm + OTP verify ───────────
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing && existing.passwordHash)
      return res.status(409).json({ message: "Account already exists. Please log in." });

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existing) {
      // User exists without password (old OTP-only user) — update them
      await db.update(users).set({ passwordHash, currentOtp: otp, otpExpiresAt: expiresAt }).where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({ email: email.toLowerCase(), passwordHash, currentOtp: otp, otpExpiresAt: expiresAt });
    }

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent to verify your email" });
  });

  // ── VERIFY OTP after registration ──────────────────────────────────────────
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Missing email or otp" });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.currentOtp !== otp) return res.status(401).json({ message: "Invalid OTP" });
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt)
      return res.status(401).json({ message: "OTP has expired" });

    await db.update(users).set({ currentOtp: null, otpExpiresAt: null, updatedAt: new Date() }).where(eq(users.id, user.id));
    (req.session as any).userId = user.id;
    res.json({ message: "Authenticated successfully" });
  });

  // ── LOGIN — returning user: email + password → instant access ──────────────
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: "No account found. Please register first." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Incorrect password" });

    (req.session as any).userId = user.id;
    res.json({ message: "Logged in successfully" });
  });

  // ── FORGOT PASSWORD — send OTP to reset ───────────────────────────────────
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.update(users).set({ currentOtp: otp, otpExpiresAt: expiresAt }).where(eq(users.id, user.id));

    await sendOtpEmail(email, otp);
    res.json({ message: "Password reset OTP sent to your email" });
  });

  // ── RESET PASSWORD — verify OTP + set new password ────────────────────────
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields required" });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.currentOtp !== otp) return res.status(401).json({ message: "Invalid OTP" });
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) return res.status(401).json({ message: "OTP has expired" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(users).set({ passwordHash, currentOtp: null, otpExpiresAt: null, updatedAt: new Date() }).where(eq(users.id, user.id));

    (req.session as any).userId = user.id;
    res.json({ message: "Password reset successfully" });
  });

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => { res.json({ message: "Logged out" }); });
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => { res.redirect("/"); });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionAny = req.session as any;
  if (!sessionAny.userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [user] = await db.select().from(users).where(eq(users.id, sessionAny.userId));
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    (req as any).user = { claims: { sub: user.id, email: user.email }, ...user };
    next();
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
