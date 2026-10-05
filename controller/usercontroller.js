import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/usermodel.js";


const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// == Regiter
export const register = async (req, res) => {
  try {
    const { username, email, password, mobilenumber, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "username, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        status: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const assignedRole = role === "admin" ? "admin" : "user";

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobilenumber: mobilenumber || "",
      role: assignedRole,
    });

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobilenumber: user.mobilenumber,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//USER LOGIN 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }


    const token = generateToken(user);

    res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobilenumber: user.mobilenumber,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//  ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // role admin
    if (user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Access denied. Only admins can login through this portal",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      status: true,
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobilenumber: user.mobilenumber,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET admin PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//UPDATE OWN PROFILE 
export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };


    if (updates.role && req.user.role !== "admin") {
      delete updates.role;
    }


    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }


    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email is already taken by another account",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE OWN PROFILE 
export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//GET ALL USERS (ADMIN ONLY) 
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      status: true,
      message: "All users retrieved successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const Profile = getAllUsers;

//get user admin and user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE USER id
export const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User deleted successfully by admin",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// LOGOUT 
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      status: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export default {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserById,
  deleteUserById,
  logout,
  Profile,
};