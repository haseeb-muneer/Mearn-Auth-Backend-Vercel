import express from "express";
import userAuth from "../Middleware/userAuth.js";
import { getData } from "../Controller/UserController.js";
const UserRoute = express.Router();
UserRoute.get("/data", userAuth, getData);
export default UserRoute;
