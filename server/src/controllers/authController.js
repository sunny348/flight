// controllers/authController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import admin from "firebase-admin";
import dotenv from "dotenv";

import {
  generateToken,          // short‑lived access token
  generateRefreshToken,   // long‑lived refresh token
  verifyRefreshToken,     // used in /refresh endpoint
} from "../utils/jwtHelpers.js";

dotenv.config();
const prisma = new PrismaClient();

/* ────────────────────────────────────────────────────────────
   1.  Firebase Admin (Google login) – initialised once
   ──────────────────────────────────────────────────────────── */
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type:                        process.env.FIREBASE_TYPE,
      project_id:                  process.env.FIREBASE_PROJECT_ID,
      private_key_id:              process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key:                 process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email:                process.env.FIREBASE_CLIENT_EMAIL,
      client_id:                   process.env.FIREBASE_CLIENT_ID,
      auth_uri:                    process.env.FIREBASE_AUTH_URI,
      token_uri:                   process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url:        process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
}

/* ────────────────────────────────────────────────────────────
   2.  Cookie settings
   ──────────────────────────────────────────────────────────── */
const cookieOptions = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === "production", // required with SameSite:none
  sameSite : "none",                                // allow cross‑origin on Vercel
  // ⚠ DO **NOT** add `domain` here – browsers reject “.vercel.app”
};

const MAX_AGE          = +process.env.JWT_EXPIRES_IN_SECONDS       || 3600;    // 1 h
const REFRESH_MAX_AGE  = +process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS || 604800; // 7 d

/* helper: sets both cookies + returns them for frontend debugging */
const issueTokens = (res, payload) => {
  const accessToken  = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: MAX_AGE * 1000,
    path  : "/",
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_MAX_AGE * 1000,
    path  : "/api/auth/refresh",   // only sent to this route
  });

  return { accessToken, refreshToken };
};

/* ────────────────────────────────────────────────────────────
   3.  Auth End‑points
   ──────────────────────────────────────────────────────────── */
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(409).json({ message: "User already exists" });

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: await bcrypt.hash(password, 12),
      },
    });

    const tokens = issueTokens(res, { id: user.id, email: user.email });
    res.status(201).json({
      user   : { id: user.id, email: user.email, name: user.name },
      ...tokens,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const tokens = issueTokens(res, { id: user.id, email: user.email });
    res.status(200).json({
      user   : { id: user.id, email: user.email, name: user.name },
      ...tokens,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "ID token is required" });

  try {
    const { uid, email, name } = await admin.auth().verifyIdToken(idToken);

    /* find by Google UID or fallback to email */
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: uid }, { email }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { googleId: uid, email, name },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data : { googleId: uid, name: user.name || name },
      });
    }

    const tokens = issueTokens(res, { id: user.id, email: user.email });
    res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
      message: "Google login successful",
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error during Google login" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = verifyRefreshToken(token);
    const user    = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error("User not found");

    const accessToken = generateToken({ id: user.id, email: user.email });
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: MAX_AGE * 1000,
      path: "/",
    });

    res.status(200).json({ accessToken, message: "Access token refreshed" });
  } catch (err) {
    console.error("Refresh error:", err);
    res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth/refresh" });
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("accessToken",  { ...cookieOptions, path: "/" });
  res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth/refresh" });
  res.status(200).json({ message: "Logout successful" });
};

export const getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  res.status(200).json({ id: req.user.id, email: req.user.email });
};
