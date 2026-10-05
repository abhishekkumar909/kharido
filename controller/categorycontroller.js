import mongoose from "mongoose";
import Category from "../model/categorymodel.js";

// Create Category 
export const addCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Category with this name already exists",
      });
    }

    const userId = req.user?.id || req.user?._id;

    const newCategory = await Category.create({
      name: trimmedName,
      description: description ? description.trim() : "",
      image: image ? image.trim() : "",
      isActive: isActive !== undefined ? isActive : true,
      userId: userId || undefined,
    });

    return res.status(201).json({
      status: true,
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// Get All Categories (GET /category)
export const getAllCategories = async (req, res) => {
  try {
    const { search, isActive, page, limit, sortBy, order } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true" || isActive === true;
    }

    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    let queryBuilder = Category.find(query)
      .sort(sortOptions)
      .populate("userId", "username email");

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 10);
      const skip = (pageNum - 1) * limitNum;
      queryBuilder = queryBuilder.skip(skip).limit(limitNum);
    }

    const categories = await queryBuilder;
    const totalCount = await Category.countDocuments(query);

    return res.status(200).json({
      status: true,
      success: true,
      message: "Categories fetched successfully",
      totalCategories: totalCount,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// Get Category by Id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Invalid category ID format",
      });
    }

    const category = await Category.findById(id).populate("userId", "username email");

    if (!category) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: true,
      success: true,
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// Update Category by ID (PUT /category/:id)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Invalid category ID format",
      });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate name if name is being changed
    if (req.body.name && req.body.name.trim()) {
      const trimmedName = req.body.name.trim();
      const duplicateCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateCategory) {
        return res.status(400).json({
          status: false,
          success: false,
          message: "Another category with this name already exists",
        });
      }
      req.body.name = trimmedName;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("userId", "username email");

    return res.status(200).json({
      status: true,
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete Category by ID (DELETE /category/:id)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        success: false,
        message: "Invalid category ID format",
      });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        status: false,
        success: false,
        message: "Category not found",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      success: true,
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

// Alternate aliases for consistent importing
export const postCategory = addCategory;
export const postcategory = addCategory;
export const getallcategories = getAllCategories;
export const getcategorybyid = getCategoryById;
export const updatecategory = updateCategory;
export const deletecategorybyid = deleteCategory;
export const deletecategory = deleteCategory;

export default {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  postcategory,
  getallcategories,
  getcategorybyid,
  updatecategory,
  deletecategorybyid,
};
