import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  resetotpSend,
  resetotpverify,
  verifyEmail,
  verifyOtpSend,
} from "../Controller/Auth.js";
import userAuth from "../Middleware/userAuth.js";
const AuthRouter = express.Router();
AuthRouter.post("/register", register);
AuthRouter.post("/login", login);
AuthRouter.post("/logout", logout);
AuthRouter.post("/verify-otp-send", userAuth, verifyOtpSend);
AuthRouter.post("/verify-email", userAuth, verifyEmail);
AuthRouter.get("/authentication", userAuth, isAuthenticated);
AuthRouter.post("/reset-otp-send", resetotpSend);
AuthRouter.post("/reset-otp-verify", resetotpverify);

export default AuthRouter;
