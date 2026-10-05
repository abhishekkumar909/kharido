import jwt from "jsonwebtoken";


export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Token nahi mila, pehle login karein",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Token invalid ya expire ho gaya hai",
    });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      status: false,
      message: "Access denied! Sirf admin hi yeh use kar sakta hai",
    });
  }
};

export default authMiddleware;
