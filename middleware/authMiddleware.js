const authMiddleware = (req, res, next) => {
  // For demonstration, let's assume a simple header check
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];

  // In a real app, you would verify this token (e.g., with JWT.verify)
  if (token === "mysecrettoken") {
    // VERY BASIC for example only!
    req.user = { id: "someUserId", role: "admin" }; // Attach user info to request
    next();
  } else {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
