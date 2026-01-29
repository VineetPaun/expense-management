import express from "express";
import { Transaction, Account } from "../db/schema.js";
import { verifyToken } from "../db/middleware.js";

const router = express.Router();

router.post("/add/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { amount, type, category } = req.body;

    const transaction = await Transaction.create({
      userId,
      accountId: id,
      amount,
      type,
      category,
    });

    // Update account balance
    const account = await Account.findOne({ _id: id, userId });
    if (account) {
      if (type === "income") {
        account.balance += parseFloat(amount);
      } else {
        account.balance -= parseFloat(amount);
      }
      await account.save();
    }

    console.log("Transaction created:", transaction._id);
    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/remove/", verifyToken, async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id || req.user._id;

    // Find the transaction first to get the amount and type
    const transactionToDelete = await Transaction.findOne({ _id: id, userId });
    if (!transactionToDelete) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update account balance
    const account = await Account.findOne({
      _id: transactionToDelete.accountId,
      userId,
    });
    if (account) {
      if (transactionToDelete.type === "income") {
        account.balance -= parseFloat(transactionToDelete.amount);
      } else {
        account.balance += parseFloat(transactionToDelete.amount);
      }
      await account.save();
    }

    const transaction = await Transaction.deleteOne({ _id: id });
    console.log(transaction);
    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const transactions = await Transaction.find({ accountId: id, userId }).sort(
      {
        createdAt: -1,
      },
    );

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
