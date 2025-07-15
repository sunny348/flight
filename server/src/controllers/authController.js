import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtHelpers.js";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Initialize Firebase Admin SDK using environment variables
if (admin.apps.length === 0) {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Updated cookie options for cross-domain
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CRITICAL: 'none' for cross-domain
  domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined, // Allow subdomains
};

// Alternative: Switch to token-based response instead of cookies
const sendTokensAsResponse = (res, user) => {
  const accessToken = generateToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Send tokens in response body instead of cookies
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
};

// Keep original cookie method as fallback
const sendTokens = (res, user) => {
  const accessToken = generateToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || "3600") * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS || "604800") * 1000,
    path: "/api/auth/refresh",
  });
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Try cookies first, send tokens in response as fallback
    sendTokens(res, newUser);
    const tokenData = sendTokensAsResponse(res, newUser);

    res.status(201).json({
      ...tokenData,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Try cookies first, send tokens in response as fallback
    sendTokens(res, user);
    const tokenData = sendTokensAsResponse(res, user);

    res.status(200).json({
      ...tokenData,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    let user = await prisma.user.findUnique({
      where: { googleId: uid },
    });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId: uid, name: user.name || name },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId: uid,
          },
        });
      }
    } else if (user.name !== name && name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Try cookies first, send tokens in response as fallback
    sendTokens(res, user);
    const tokenData = sendTokensAsResponse(res, user);

    res.status(200).json({
      ...tokenData,
      message: "Google login successful",
    });
  } catch (error) {
    console.error("Google login error:", error);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        message: "Firebase ID token has expired. Please re-authenticate.",
      });
    }
    if (error.code === "auth/argument-error") {
      return res.status(401).json({ message: "Invalid Firebase ID token." });
    }
    res.status(500).json({ message: "Server error during Google login" });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken: receivedToken } = req.cookies;

  if (!receivedToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(receivedToken);
    if (!decoded || !decoded.id) {
      res.clearCookie("refreshToken", {
        ...cookieOptions,
        path: "/api/auth/refresh",
      });
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.clearCookie("refreshToken", {
        ...cookieOptions,
        path: "/api/auth/refresh",
      });
      return res
        .status(403)
        .json({ message: "User not found for this refresh token" });
    }

    const newAccessToken = generateToken({ id: user.id, email: user.email });

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || "3600") * 1000,
    });

    res.status(200).json({ 
      message: "Access token refreshed successfully",
      accessToken: newAccessToken // Also send in response
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.clearCookie("refreshToken", {
      ...cookieOptions,
      path: "/api/auth/refresh",
    });
    res.status(500).json({ message: "Server error during token refresh" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      ...cookieOptions,
      path: "/",
    });

    res.clearCookie("refreshToken", {
      ...cookieOptions,
      path: "/api/auth/refresh",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.clearCookie("accessToken", { ...cookieOptions, path: "/" });
    res.clearCookie("refreshToken", {
      ...cookieOptions,
      path: "/api/auth/refresh",
    });
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const getMe = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ message: "Not authorized, user information not available." });
  }

  try {
    res.status(200).json({
      id: req.user.id,
      email: req.user.email,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching user information" });
  }
};