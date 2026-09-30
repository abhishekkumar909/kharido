import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/usermodel.js";

//REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

   
    if (!username || !email || !password) {
      return res.status(400).json({
        status:false,
         message: "All fields are required"
         });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status:false,
         message: "User already exists" 
        });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
        status: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ 
        status:false,
        message: "Server error", error: error.message 
    });
  }
};

//  LOGIN API

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
         status:false,
         message: "Email and password are required" 
        });
    }

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
         status:false,
         message: "Invalid email or password"
         });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
         status:false,
        message: "Invalid email or password" 
    });
    }


    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
        status:true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
         status:true,
         message: "Server error", error: error.message
         });
  }
};

//  GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default register;