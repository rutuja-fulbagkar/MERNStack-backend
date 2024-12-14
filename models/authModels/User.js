import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
   passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "user", "guest", "customer", "employee", "client", "student", "hr", "intern"],
    default: "user"
  },
  profile: { type: mongoose.Schema.Types.Mixed }, // Allows storing specific fields for each role dynamically
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationTokenExpiry: { type: Date },
  isPhoneVerified: { type: Boolean, default: false },
  phoneVerificationToken: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
},
  { timestamps: true } // Enables createdAt and updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;


// schema is designed to support different
// user roles(admin, user, guest) and verification statuses for both email and phone.

// 1. Register API : The register API will:
// Create a new user if the email does not exist.
// Hash the password.
// Optionally, send an email or OTP verification if you have email or SMS service.
////////////////////////////////////////////////////////////////////////////////
// 2. Login API : The login API will:
// Check if the user exists.
// Verify the password.
// Optionally check if the email or phone is verified based on your requirements.
// Generate a JWT token.
///////////////////////////////////////////////////////////////////////////////
// 4. Logout API
// Clear the token (if using a token blacklist).


// Data Type:Authentication Tokens
// Recommended Storage: Cookies(with HttpOnly and Secure flags)

// Data Type: Persistent Preferences
// Recommended Storage:localStorage

// Data Type: Temporary Session Data
// Recommended Storage:sessionStorage
/////////////////////////////////////////////////////////////////////////////////
// 5. Forgot Password API
// Send a reset token to the email.
// Allow the user to reset the password using the token.
/////////////////////////////////////////////////////////////////////////////////////
// 6.OTP Verification API
// Verify the OTP sent to the user's phone.


// - config/
// - controllers/
//   - authController.js
// - middlewares/
//   - authMiddleware.js
// - models/
//   - userModel.js
// - routes/
//   - authRoutes.js
// - services/
//   - emailService.js
//   - otpService.js
// - server.js


// Role-Based Access Middleware (middlewares/auth.js)
