import express from "express";
import cors from "cors";
import mongoose, { model, Query } from "mongoose";
import "dotenv/config";
import { connectDB } from "./db/connectDB.js";
import { usersModel } from "./db/schema.js";
import bcrypt from "bcrypt";
import { checkUser, validateAuthInput, verifyToken } from "./db/middleware.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

connectDB();

app.post(
  "/signup",
  validateAuthInput,
  checkUser("signup"),
  async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersModel.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
    });
  },
);

app.post(
  "/signin",
  validateAuthInput,
  checkUser("signin"),
  async (req, res) => {
    const { username, password } = req.body;

    const checkPassword = await bcrypt.compare(password, req.user.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { id: req.user._id, username: req.user.username },
      JWT_SECRET,
    );
    res.json({
      username,
      checkPassword,
      token,
      message: "SignIn successful",
    });
  },
);

app.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "User profile fetched successfully",
    user: req.user, // Information from the decoded JWT
  });
});

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
