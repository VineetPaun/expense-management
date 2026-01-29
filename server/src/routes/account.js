import express from "express";
import { Account, Transaction } from "../db/schema.js";
import { verifyToken } from "../db/middleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const accounts = await Account.find({ userId });
    res.status(200).json({ accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { bankName, accountType } = req.body;
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    const account = await Account.create({
      userId,
      bankName,
      accountType,
    });

    res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: error.errors,
    });
  }
});

router.post("/remove/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const account = await Account.findOneAndDelete({ _id: id, userId });

    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or unauthorized" });
    }

    await Transaction.deleteMany({ accountId: id });

    res.json({ message: "Account removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/edit/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountType } = req.body;
    const userId = req.user.id || req.user._id;

    const account = await Account.findOneAndUpdate(
      { _id: id, userId },
      { bankName, accountType },
      { new: true },
    );

    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or unauthorized" });
    }

    res.json({ message: "Account updated successfully", account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
