import express from "express";
import {
  addAddress,
  getAllAddress,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "../controller/addresscontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/address", authMiddleware, addAddress);
router.get("/address", authMiddleware, getAllAddress);
router.get("/address/:id", authMiddleware, getAddressById);
router.put("/address/:id", authMiddleware, updateAddress);
router.delete("/address/:id", authMiddleware, deleteAddress);

export default router;
