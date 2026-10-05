import Product from "../model/productmodel.js";
import mongoose from "mongoose";

// Create Product 
export const postproduct = async (req, res) => {
  try {
    const { name, description, category, brand, price, stock, sku, images } = req.body;


    if (
      !name ||!description ||!category ||!brand ||price === undefined ||price === null
      ||stock === undefined ||
      stock === null ||
      !sku
    ) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Please provide all required fields (name, description, category, brand, price, stock, sku)",
      });
    }

  
    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Stock must be a valid non-negative integer",
      });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        status: false,
        success: false,
        message: "Unauthorized! User ID not found in token",
      });
    }

    // Check if SKU 
    const normalizedSku = sku.toString().trim().toUpperCase();
    const existingSku = await Product.findOne({ sku: normalizedSku });
    if (existingSku) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    // Format images safely
    let formattedImages = [];
    if (Array.isArray(images)) {
      formattedImages = images.filter((img) => typeof img === "string" && img.trim().length > 0);
    } else if (typeof images === "string" && images.trim().length > 0) {
      formattedImages = [images.trim()];
    }

    const newProduct = await Product.create({
      userId,
      name: name.toString().trim(),
      description: description.toString().trim(),
      category: category.toString().trim(),
      brand: brand.toString().trim(),
      price: numPrice,
      stock: numStock,
      sku: normalizedSku,
      images: formattedImages,
    });

    return res.status(201).json({
      status: true,
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// Get All Products 
export const getallproducts = async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice, page, limit, sortBy, order } = req.query;

    const query = {};

    // Category filter
    if (category) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Brand filter
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand.trim()}$`, "i") };
    }

    // Keyword search 
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Price range 
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Build sort option
    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    // Pagination
    let queryBuilder = Product.find(query)
      .sort(sortOptions)
      .populate("userId", "username email");

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const skip = (pageNum - 1) * limitNum;
      queryBuilder = queryBuilder.skip(skip).limit(limitNum);
    }

    const products = await queryBuilder;
    const totalCount = await Product.countDocuments(query);

    return res.status(200).json({
      status: true,
      success: true,
      message: "Products fetched successfully",
      totalproducts: totalCount,
      totalProducts: totalCount,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get Product By ID
export const getproductbyid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Invalid product ID format",
      });
    }

    const singleProduct = await Product.findById(id).populate("userId", "username email");

    if (!singleProduct) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: true,
      success: true,
      message: "Product fetched successfully",
      product: singleProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// Update Product (PUT /product/:id)
export const updateproduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Invalid product ID format",
      });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Product not found",
      });
    }

    // Role check: Only product creator 
    const currentUserId = req.user?.id || req.user?._id;
    if (
      existingProduct.userId &&
      currentUserId &&
      existingProduct.userId.toString() !== currentUserId.toString() &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        status: false,
        success: false,
        message: "Access denied! You can only update your own products",
      });
    }

    // If updating SKU
    if (req.body.sku) {
      const normalizedSku = req.body.sku.toString().trim().toUpperCase();
      const duplicateSku = await Product.findOne({
        sku: normalizedSku,
        _id: { $ne: id },
      });
      if (duplicateSku) {
        return res.status(400).json({
          status: false,
          success: false,
          message: "Another product with this SKU already exists",
        });
      }
      req.body.sku = normalizedSku;
    }

    // If updating price
    if (req.body.price !== undefined) {
      const numPrice = Number(req.body.price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          status: false,
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }
      req.body.price = numPrice;
    }

    if (req.body.stock !== undefined) {
      const numStock = Number(req.body.stock);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({
          status: false,
          success: false,
          message: "Stock must be a valid non-negative integer",
        });
      }
      req.body.stock = numStock;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId", "username email");

    return res.status(200).json({
      status: true,
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Delete Product (DELETE /product/:id)
export const deleteproductbyid = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Invalid product ID format",
      });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Product not found",
      });
    }

    // Role check: Only product creator or admin can delete
    const currentUserId = req.user?.id || req.user?._id;
    if (
      existingProduct.userId &&
      currentUserId &&
      existingProduct.userId.toString() !== currentUserId.toString() &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        status: false,
        success: false,
        message: "Access denied! You can only delete your own products",
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// Aliases for camelCase naming


export default {
  postproduct,
  getallproducts,
  updateproduct,
  getproductbyid,
  deleteproductbyid,

};

