import { model, Schema } from "mongoose";

const PlaySchema = new Schema({
  Missed: Boolean,
  PlayType: String,
  Team: { type: Schema.Types.ObjectId, ref: "Team" },
  Player: { type: Schema.Types.ObjectId, ref: "User" },
  Game: { type: Schema.Types.ObjectId, ref: "Game" },
  Quarter: Number,
  Time2: Date,
  Time: String,
});

export default model("Play", PlaySchema);
