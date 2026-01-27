import mongoose from "mongoose";
const { Schema } = mongoose;

const users = new Schema({
  userId: Schema.Types.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const usersModel = mongoose.model("users", users);

export { usersModel };
