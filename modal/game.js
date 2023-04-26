import { model, Schema } from "mongoose";

const gameSchema = new Schema({
  homeTeam: String,
  awayTeam: String,
  coach: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model("Game", gameSchema);
