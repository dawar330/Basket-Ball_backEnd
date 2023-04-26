import { createRequire } from "module";
import user from "../modal/user.js";
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

export const getUserByToken = async (token) => {
  try {
    const tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let tokenUser = await user.findOne({ email: tokenData.email });
    return tokenUser;
  } catch (err) {
    return err;
  }
};

export const getJwt = (email, role) => {
  return jwt.sign(
    {
      email: email,
      role: role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "2h",
    }
  );
};
