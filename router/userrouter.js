import express from "express";
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  logout,
} from "../controller/usercontroller.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// login mathod
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);

// user profiles
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/profile", authMiddleware, deleteProfile);
router.get("/logout", authMiddleware, logout);

// get all user only admin have permite
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);

export default router;