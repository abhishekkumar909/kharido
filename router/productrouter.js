import express from "express";
import {
  postproduct,
  getallproducts,
  updateproduct,
  getproductbyid,
  deleteproductbyid,
} from "../controller/productcontroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/product", getallproducts);
router.get("/products", getallproducts);
router.get("/product/:id", getproductbyid);
router.get("/products/:id", getproductbyid);


router.post("/product", authMiddleware, postproduct);
router.post("/products", authMiddleware, postproduct);
router.put("/product/:id", authMiddleware, updateproduct);
router.put("/products/:id", authMiddleware, updateproduct);
router.delete("/product/:id", authMiddleware, deleteproductbyid);
router.delete("/products/:id", authMiddleware, deleteproductbyid);

export default router;