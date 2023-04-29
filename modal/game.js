import { model, Schema } from "mongoose";

const gameSchema = new Schema({
  homeTeam: { type: Schema.Types.ObjectId, ref: "Team" },
  awayTeam: { type: Schema.Types.ObjectId, ref: "Team" },
  coach: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model("Game", gameSchema);
