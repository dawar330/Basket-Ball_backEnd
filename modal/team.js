import { model, Schema } from "mongoose";

const teamSchema = new Schema({
  teamName: String,
  Image: String,
  teamCity: String,
  Coach: { type: Schema.Types.ObjectId, ref: "User" },
  Players: { type: [Schema.Types.ObjectId], ref: "User" },
});

export default model("Team", teamSchema);
