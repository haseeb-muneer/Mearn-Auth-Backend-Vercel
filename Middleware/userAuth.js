import jwt from "jsonwebtoken";
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ success: false, msg: "Unauthorized User Login Again" });
  }
  try {
    const Decodetoken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(Decodetoken);
    if (!req.body) {
      req.body = {};
    }
    if (Decodetoken) {
      req.body.userid = Decodetoken.id;
    } else {
      return res.json({ success: false, msg: "Unauthorized User Login Again" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, msg: error.message });
  }
};
export default userAuth;
