import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyotp: { type: String, default: "" },
  verifyotpExpiresAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  resetotp: { type: String, default: "" },
  resetotpExpiresAt: { type: Number, default: 0 },
});
const UserModel = new mongoose.model("user", userSchema);
export default UserModel;
