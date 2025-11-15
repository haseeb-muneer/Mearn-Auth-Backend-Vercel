import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import AuthRouter from "./Routers/AuthRoutes.js";
import connectDB from "./config/mongodb.js";
import UserRoute from "./Routers/UserRoutes.js";
const app = express();
const port = "4000" || process.env.PORT;
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const allowedorigin = ["https://mearn-auth-vercel-frotend.vercel.app"];
app.use(cors({ origin: allowedorigin, credentials: true }));
connectDB();
app.use("/api/auth", AuthRouter);
app.use("/api/user", UserRoute);
app.get("/", (req, res) => {
  res.send("Api working");
});
app.listen(port, () => {
  console.log(`Server is lsitening on Port ${port}`);
});
