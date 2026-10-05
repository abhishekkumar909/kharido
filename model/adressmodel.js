import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        fullname: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
        },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        country: {
            type: String,
            default: "India",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;