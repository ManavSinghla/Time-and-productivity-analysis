import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    preferences: {
      defaultCategory: { type: String, default: "Study" },
      dailyGoal: { type: Number, default: 120 }
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
