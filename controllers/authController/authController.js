import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/authModels/User.js";
import {
  sendForgotPassEmail,
  sendOTP,
  sendVerificationEmail,
} from "../../services/emailService.js"; // Custom service

// Register API

const JWT_SECRET = process.env.JWT_SECRET || "myStrongSecret123!@#";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          type: "validationError"
        },
        message: "Name, email,phone and password are required."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 409,
          type: "conflictError",
          resolutions:"Try using a different email address.",
        },
        message: "Email already exists."
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("otp", otp);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "user",

      otp, // Store OTP temporarily for verification
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });

    // Save the user to the database
    await user.save();

    // Send verification email and/or OTP
    if (email) await sendVerificationEmail(user.email, otp);
    if (phone) await sendOTP(phone, otp);

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your account.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
      token,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Login API
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
          code: 400,
        type: "ValidationError",
      },
      message: "Email and password are required.",
    });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 404,
          type: "notFoundError",
           resolution: "Ensure you have registered using this email address.",
        },
        message: "User not found. Please register first.",
      });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          type: "invalidCredentials",
          resolution: "Please check your email and password.",
        },
        message: "Invalid credentials. Please check your email or password.",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 403,
          type: "unauthorized",
          resolution: "Please verify your email to proceed.",
        },
        message: "Email not verified. Please verify your email to proceed.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600 * 1000,
    });

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      }
    });
  } catch (error) {
    // Handle server errors
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// OTP Verification API
export const verifyOTP = async (req, res) => {
  // Receive email and OTP from request body
  const { otp, email } = req.body;
  try {
    // Check if both email and OTP are provided
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          type: "ValidationError",
          resolution: "Please provide your email and OTP.",
        },
        message: "Email and OTP are required."
      });
    }
    // Find the user by email and OTP
    const user = await User.findOne({ email, otp });

    if (!user || user.otpExpiry < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP." });

    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now login."
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// // Forgot Password API mail sent
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({
          status: 'Not Found',
          code: 404,
          message: 
          "User with this email does not exist." });
    // Generate reset token (JWT for simplicity, can also use a random strin
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    // Save the token and expiry in the database
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    const resetUrl = `http://localhost:8000/reset-password?token=${resetToken}`;
    const customContent = `Click here to reset your password: <a href="${resetUrl}" class="reset-link">${resetUrl}</a>`;
    await sendForgotPassEmail(email, "Password Reset Request", customContent);

    res
      .status(200)
      .json({
        status: 'success',
        code: 200,
        message: "Password reset email sent successfully."
      });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate the new password (e.g., length check)
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({
          status: 'Invalid password',
          code: 400,
          message: "Password must be at least 6 characters long."
        });
    }

    // Decode and verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user with the valid token and check expiration
    const user = await User.findOne({
      _id: decoded.id, // Ensure user matches the decoded ID
      resetToken: token, // Check if token matches the one stored in DB
      resetTokenExpiry: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({
        status: 'Bad Request',
        code: 400,
        message: "Invalid or expired token."
      });
    }

    // Hash the new password and update it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined; // Clear the token after using it
    user.resetTokenExpiry = undefined; // Clear the expiration date
    await user.save();

    res.status(200).json({
      status: 'Success',
      code: 200,
      message: "Password reset successfully."
    });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
