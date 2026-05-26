import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/Auth";
import { AuthRequest } from "../middleware/Middleware";
import crypto from "crypto";

// Single organization this platform serves
const ORGANIZATION = "WamiAgro, Ghana";

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password, role, farmSize, region } = req.body;

    // ── Block admin self-registration ──────────────────────────────────────
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be self-registered.",
      });
    }

    // ── Check existing user ────────────────────────────────────────────────
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ── Hash password ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Build payload ──────────────────────────────────────────────────────
    const userPayload: Record<string, any> = {
      name,
      email,
      password: hashedPassword,
      role: role ?? "farmer",
    };

    if (role === "farmer") {
      userPayload.farmSize = farmSize;
      userPayload.region   = region;
    }

    if (role === "agricultural_officer") {
      // Organization is fixed — no need to store it per user
      userPayload.region = region;
    }

    // ── Create & respond ───────────────────────────────────────────────────
    const user = await User.create(userPayload);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user,
      // Expose org name in response so the client can display it
      ...(role === "agricultural_officer" && { organization: ORGANIZATION }),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// export const registerUser = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check existing user
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists"
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     // Generate token
//     const token = jwt.sign(
//       {
//         id: user._id
//       },
//       process.env.JWT_SECRET as string,
//       {
//         expiresIn: "7d"
//       }
//     );

//     res.status(201).json({
//       success: true,
//       token,
//       user
//     });

//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error"
//     });
//   }
// };

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



// ====================================
// GET PROFILE
// ====================================

export const getProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ====================================
// UPDATE PROFILE
// ====================================

export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email
      },
      {
        new: true
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ====================================
// CHANGE PASSWORD
// ====================================

export const changePassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const {
      currentPassword,
      newPassword
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


export const forgotPassword = async (
  req: Request,
  res: Response
) => {

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // Generate token
  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  user.resetPasswordToken = resetToken;

  user.resetPasswordExpire =
    new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetUrl =
    `http://localhost:3000/reset-password/${resetToken}`;

  // Send email here

  res.json({
    success: true,
    message: "Reset email sent",
    resetUrl
  });
};



export const resetPassword = async (
  req: Request,
  res: Response
) => {

  const { token } = req.params;

  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: {
      $gt: Date.now()
    }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token"
    });
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  user.password = hashedPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Password reset successful"
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response
) => {

  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token"
    });
  }

  user.emailVerified = true;

  user.verificationToken = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Email verified"
  });
};