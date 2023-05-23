import { model, Schema } from "mongoose";

const TimeOutchema = new Schema({
  Secs: String,
  Team: { type: Schema.Types.ObjectId, ref: "Team" },
  Game: { type: Schema.Types.ObjectId, ref: "Game" },
  Quarter: Number,
  Time: Date,
});

export default model("TimeOut", TimeOutchema);
