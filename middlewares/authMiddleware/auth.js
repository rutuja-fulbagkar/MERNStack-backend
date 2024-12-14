import JWT  from 'jsonwebtoken';
import User from '../../models/authModels/User.js';

// focused on authenticating users, checking roles, and authorizing access to specific routes
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization, // The token is expected in the Authorization header
      process.env.JWT_SECRET     // The secret key is used to verify the token
    );
    req.user = decode;            // Attach decoded user info to `req` object
    next();                       // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};


//  Dynamic Role Permission Middleware
export const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
      }

      // Decode the token
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Fetch the user from the database
      const user = await User.findById(req.user.id);

      // Check if the user's role is included in the allowed roles
      if (roles.includes(user.role)) {
        next(); // Role is authorized, proceed to the route handler
      } else {
        return res.status(403).json({ message: `Access denied. Allowed roles: ${roles.join(", ")}.` });
      }
    } catch (error) {
      console.error("Error in checkRole middleware:", error);
      return res.status(500).json({ message: "Server error." });
    }
  };
};


export const isCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    // Decode the token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fetch the user from the database
    const user = await User.findById(req.user.id);

    // Check if the user's role is customer
    if (user.role === "customer") {
      next(); // Role is customer, proceed to the route handler
    } else {
      return res.status(403).json({ message: "Access denied. Customer role required." });
    }
  } catch (error) {
    console.error("Error in isCustomer middleware:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
