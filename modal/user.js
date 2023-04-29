import { model, Schema } from "mongoose";

const userSchema = new Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["Player", "Coach", "Parent"],
    default: "Player",
  },
});

export default model("User", userSchema);
