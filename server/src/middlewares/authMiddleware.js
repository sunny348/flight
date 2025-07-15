import { verifyToken } from "../utils/jwtHelpers.js";

export const protect = async (req, res, next) => {
  let token;

  // Check cookies first (for when cookies work)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Check Authorization header as fallback (for cross-domain scenarios)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for custom header (alternative approach)
  else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};