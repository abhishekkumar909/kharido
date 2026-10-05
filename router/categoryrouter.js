import express from "express";
import {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controller/categorycontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/category", getAllCategories);
router.get("/categories", getAllCategories);
router.get("/category/:id", getCategoryById);
router.get("/categories/:id", getCategoryById);

// Protected routes (require login)
router.post("/category", authMiddleware, addCategory);
router.post("/categories", authMiddleware, addCategory);
router.put("/category/:id", authMiddleware, updateCategory);
router.put("/categories/:id", authMiddleware, updateCategory);
router.delete("/category/:id", authMiddleware, deleteCategory);
router.delete("/categories/:id", authMiddleware, deleteCategory);

export default router;
