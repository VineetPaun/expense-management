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

const accounts = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bankName: {
      type: String,
      required: true,
      enum: ["HDFC", "SBI", "BOB", "Axis"],
    },
    accountType: {
      type: String,
      enum: ["Savings", "Current"],
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const transactions = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", users);
const Account = mongoose.model("Account", accounts);
const Transaction = mongoose.model("Transaction", transactions);

export { User, Account, Transaction };
