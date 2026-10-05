import Address from "../model/adressmodel.js";

// Create Address
export const addAddress = async (req, res) => {
    try {
        const { fullname, phone, pincode, address, city, state, country } = req.body;
        const userId = req.user.id;

        if (!fullname || !phone || !pincode || !address || !city || !state) {
            return res.status(400).json({
                status: false,
                message: "Please provide all required fields (fullname, phone, pincode, address, city, state)",
            });
        }

        const newAddress = await Address.create({
            userId,
            fullname,
            phone,
            pincode,
            address,
            city,
            state,
            country: country || "India",
        });

        res.status(201).json({
            status: true,
            message: "Address created successfully",
            address: newAddress,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error creating address",
            error: error.message,
        });
    }
};

// Get All Addresses 
export const getAllAddress = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id });

        res.status(200).json({
            status: true,
            message: "Addresses fetched successfully",
            totalAddresses: addresses.length,
            addresses,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error fetching addresses",
            error: error.message,
        });
    }
};

// Get Address by ID
export const getAddressById = async (req, res) => {
    try {
        const singleAddress = await Address.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!singleAddress) {
            return res.status(404).json({
                status: false,
                message: "Address not found",
            });
        }

        res.status(200).json({
            status: true,
            message: "Address fetched successfully",
            address: singleAddress,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error fetching address",
            error: error.message,
        });
    }
};

// Update Address by ID
export const updateAddress = async (req, res) => {
    try {
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({
                status: false,
                message: "Address not found or unauthorized",
            });
        }

        res.status(200).json({
            status: true,
            message: "Address updated successfully",
            address: updatedAddress,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error updating address",
            error: error.message,
        });
    }
};

// Delete Address by ID
export const deleteAddress = async (req, res) => {
    try {
        const deletedAddress = await Address.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!deletedAddress) {
            return res.status(404).json({
                status: false,
                message: "Address not found or unauthorized",
            });
        }

        res.status(200).json({
            status: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error deleting address",
            error: error.message,
        });
    }
};



export default {
    addAddress,
    getAllAddress,
    getAddressById,
    updateAddress,
    deleteAddress,

};