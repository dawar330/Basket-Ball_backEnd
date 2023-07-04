import { model, Schema } from "mongoose";

const userSchema = new Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["Player", "Coach"],
    default: "Player",
  },
  avatar: { type: String, default: "" },
  AvailableGames: {
    type: Number,
    default: 6,
  },
  PlayingLevel: String,
  Height: Number,
  Weight: Number,
  WingSpan: Number,
  Vertical: Number,
  CGPA: Number,
  AAU: Boolean,
  AAUTeamName: String,
  AAUAgeLevel: String,
  AAUState: String,
});

export default model("User", userSchema);
