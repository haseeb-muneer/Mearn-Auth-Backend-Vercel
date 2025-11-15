import UserModel from "../Model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailerTransport.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/EmailTemplate.js";
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, msg: "incomplete credentials" });
  }
  try {
    const existinguser = await UserModel.findOne({ email });
    console.log(existinguser);
    if (existinguser) {
      return res.json({ success: false, msg: "Email already registered" });
    }
    const hashedpass = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: name,
      email: email,
      password: hashedpass,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to: email,
      subject: "Welcome to greatStack",
      text: `Welcome to greatStack Website.Your account has been created with your email : ${email}`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, msg: error.msg });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, msg: "Incomplete Credentials" });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, msg: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, msg: "Incorrect Password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
export const verifyOtpSend = async (req, res) => {
  const { userid } = req.body;
  console.log(userid);
  try {
    const user = await UserModel.findById(userid);

    if (user.isVerified) {
      return res.json({ success: false, msg: "email already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // otp error
    user.verifyotp = otp;
    user.verifyotpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      to: user.email,
      from: process.env.SENDER_MAIL,
      subject: "Account Verification OTP",

      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      msg: "Verification otp is sent to email",
    });
  } catch (error) {}
};
export const verifyEmail = async (req, res) => {
  const { otp, userid } = req.body;
  console.log(userid);
  const user = await UserModel.findById(userid);
  if (!user) {
    return res.json({ success: false });
  }
  try {
    if (!otp || user.verifyotp !== otp) {
      return res.json({ success: false, msg: "Invalid Otp" });
    }
    if (user.verifyotpExpiresAt < Date.now()) {
      return res.json({ success: false, msg: "OTP Expired" });
    }
    user.isVerified = true;
    user.verifyotp = "";
    user.verifyotpExpiresAt = 0;
    await user.save();
    return res.json({ success: true, msg: "Email Verified" });
  } catch (error) {
    return res.json({ suucces: false, msg: error.message });
  }
};
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
export const resetotpSend = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, msg: "please enter email" });
  }
  const user = await UserModel.findOne({ email });
  try {
    if (!user) {
      return res.json({ success: false, msg: "email not registered" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetotp = otp;
    user.resetotpExpiresAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    const mailOptions = {
      to: email,
      from: process.env.SENDER_MAIL,
      subject: "Reset Password OTP",
      text: `Your otp is ${otp}. Please reset your password using this otp.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, msg: "Otp sent to your email" });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
export const resetotpverify = async (req, res) => {
  const { otp, email, newpassword } = req.body;
  if (!otp || !email || !newpassword) {
    return res.json({
      success: false,
      msg: "email password and otp is required",
    });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, msg: "User not found" });
    }
    if (otp === "" || user.resetotp !== otp) {
      return res.json({ success: false, msg: "Otp Not Correct" });
    }
    if (user.resetotpExpiresAt < Date.now()) {
      return res.json({ success: false, msg: "Otp Expired" });
    }
    const hashedpass = await bcrypt.hash(newpassword, 10);
    user.password = hashedpass;
    user.resetotp = "";
    user.resetotpExpiresAt = 0;
    await user.save();
    return res.json({
      success: true,
      msg: "Password has been  Reset Successfully",
    });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
