import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./db/connectDB.js";
import userRouter from "./routes/user.js";
import accountRouter from "./routes/account.js";
import transactionRouter from "./routes/transaction.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

connectDB();

// Routes
app.use("/", userRouter);
app.use("/account", accountRouter);
app.use("/account/transaction", transactionRouter);

app.delete("/drop", async (req, res) => {
  try {
    await mongoose.connection.dropDatabase();
    res.json({ message: "Database dropped successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("App started on port 3000");
});
