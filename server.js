import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./router/userrouter.js";

dotenv.config();

const app = express();


app.use(express.json());


app.use("/", userRouter);

const port = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((err) => {
  console.error("DB connection error:", err);
});
