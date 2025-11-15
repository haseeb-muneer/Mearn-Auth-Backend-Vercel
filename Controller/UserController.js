import UserModel from "../Model/User.js";
export const getData = async (req, res) => {
  const { userid } = req.body;

  try {
    const user = await UserModel.findById(userid);
    if (!user) {
      return res.json({ success: false, msg: "user not found" });
    }
    return res.json({
      success: true,
      userData: {
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
