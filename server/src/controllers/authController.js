// controllers/authController.js
import bcrypt from "bcryptjs";
import admin from "firebase-admin";
import dotenv from "dotenv";

import prisma from "../lib/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  generateToken,          // short‑lived access token
  generateRefreshToken,   // long‑lived refresh token
  verifyRefreshToken,     // used in /refresh endpoint
} from "../utils/jwtHelpers.js";

dotenv.config();

/* ────────────────────────────────────────────────────────────
   1.  Firebase Admin (Google login) – initialised once
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
// In production the client (Vercel) and API (Render) live on different
// domains, so cookies must be SameSite=None to be sent cross-site — and
// browsers only allow SameSite=None together with Secure (HTTPS). Locally we
// stay on http://localhost, where Secure cookies are dropped, so use Lax.
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

const MAX_AGE          = +process.env.JWT_EXPIRES_IN_SECONDS       || 3600;    // 1 h
const REFRESH_MAX_AGE  = +process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS || 604800; // 7 d

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
   (input is validated by Zod middleware before reaching here)
   ──────────────────────────────────────────────────────────── */
export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (await prisma.user.findUnique({ where: { email } }))
    throw new AppError(409, "User already exists");

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
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || !(await bcrypt.compare(password, user.password)))
    throw new AppError(401, "Invalid credentials");

  const tokens = issueTokens(res, { id: user.id, email: user.email });
  res.status(200).json({
    user   : { id: user.id, email: user.email, name: user.name },
    ...tokens,
    message: "Login successful",
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    throw new AppError(401, "Invalid or expired Google ID token");
  }
  const { uid, email, name } = decoded;

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
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError(401, "No refresh token");

  const payload = verifyRefreshToken(token);
  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.id } })
    : null;

  if (!user) {
    res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth/refresh" });
    throw new AppError(403, "Invalid or expired refresh token");
  }

  const accessToken = generateToken({ id: user.id, email: user.email });
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: MAX_AGE * 1000,
    path: "/",
  });

  res.status(200).json({ accessToken, message: "Access token refreshed" });
});

export const logout = (req, res) => {
  res.clearCookie("accessToken",  { ...cookieOptions, path: "/" });
  res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth/refresh" });
  res.status(200).json({ message: "Logout successful" });
};

export const getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  res.status(200).json({ id: req.user.id, email: req.user.email });
};
