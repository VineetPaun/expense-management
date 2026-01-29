import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../db/schema.js";
import { validateAuthInput, checkUser, verifyToken } from "../db/middleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

router.post(
  "/signup",
  validateAuthInput,
  checkUser("signup"),
  async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
    });
  },
);

router.post(
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
      userId: req.user._id,
      username,
      token,
      message: "SignIn successful",
    });
  },
);

router.get("/me", verifyToken, (req, res) => {
  res.json({
    message: "User profile fetched successfully",
    user: req.user,
  });
});

export default router;
