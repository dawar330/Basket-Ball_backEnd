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
  PlayingLevel: { type: String, default: "" },
  Height: { type: Number, default: 0 },
  Weight: { type: Number, default: 0 },
  WingSpan: { type: Number, default: 0 },
  Vertical: { type: Number, default: 0 },
  CGPA: { type: Number, default: 0 },
  AAU: { type: Boolean, default: false },
  AAUTeamName: { type: String, default: "" },
  AAUAgeLevel: { type: String, default: "" },
  AAUState: { type: String, default: "" },
});

export default model("User", userSchema);
