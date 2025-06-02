const jwt = require("jsonwebtoken");

// ======================
// ==== Generate JWT ====
// ======================
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "4h" } // Default: 1 hour expiry
  );
};

// ===========================
// ==== Authentication Middleware ====
// ===========================
const requireLogin = (req, res, next) => {
  // 1. Extract token from "Authorization" header
  const authHeader = req.headers["authorization"];

  // 2. Reject if no token provided
  if (!authHeader) {
    return res.status(401).json({
      error: "Unauthorized: No token provided",
    });
  }

  // 3. Split "Bearer <token>"
  const token = authHeader.split(" ")[1]; // Get the token part

  // 4. Reject if token is malformed
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized: Malformed token",
    });
  }

  // 5. Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({
        error: "Unauthorized: Invalid or expired token",
      });
    }

    // 6. Attach decoded user data to the request
    req.user = decoded;
    next(); // Proceed to the next middleware/route
  });
};

module.exports = {
  generateToken,
  requireLogin,
};
