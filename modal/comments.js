import { model, Schema } from "mongoose";

const commentSchema = new Schema({
  comment: String,
  gameID: { type: Schema.Types.ObjectId, ref: "Game" },
  userID: { type: Schema.Types.ObjectId, ref: "User" },
  time: Date,
});

export default model("Comment", commentSchema);
