import { model, Schema } from "mongoose";

const gameSchema = new Schema({
  homeTeam: { type: Schema.Types.ObjectId, ref: "Team" },
  awayTeam: { type: Schema.Types.ObjectId, ref: "Team" },
  coach: { type: Schema.Types.ObjectId, ref: "User" },
  TimeOutLimit: Number,
  FoulLimit: Number,
  startTime: Date,
  endTime: Date,

  ScheduledDate: Date,
  TimeDistribution: String,
  TotalTime: Number,
});

export default model("Game", gameSchema);
