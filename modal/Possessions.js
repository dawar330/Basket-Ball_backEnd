import { model, Schema } from "mongoose";

const PossessionSchema = new Schema({
  Team: { type: Schema.Types.ObjectId, ref: "Team" },
  Game: { type: Schema.Types.ObjectId, ref: "Game" },
  Quarter: Number,
  Time: String,
});

export default model("Possesion", PossessionSchema);
