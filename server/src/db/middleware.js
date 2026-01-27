import { usersModel } from "../db/schema.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const validateAuthInput = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  next();
};

const checkUser = (mode) => async (req, res, next) => {
  try {
    const { username } = req.body;

    const user = await usersModel.findOne({ username });

    // SIGNUP → user should NOT exist
    if (mode === "signup" && user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // SIGNIN → user MUST exist
    if (mode === "signin" && !user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // pass user forward (if exists)
    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user (id, username) to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

export { validateAuthInput, checkUser, verifyToken };
