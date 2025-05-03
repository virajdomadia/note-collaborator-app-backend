const jwt = require("jsonwebtoken");

// Middleware to protect routes
const protect = (req, res, next) => {
  let token;

  // Check if token is in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get the token from the Authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to the request object
      req.user = decoded.id;
      next();
    } catch (err) {
      res.status(401).json({ message: "Not authorized" });
    }
  }

  // If there's no token
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
