import express from "express";
import { registerUser, loginUser, getCurrentUser, updateProfile, changePassword, deleteAccount, addFriend, getLeaderboard } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.delete("/account", protect, deleteAccount);
router.post("/friends/add", protect, addFriend);
router.get("/leaderboard", protect, getLeaderboard);

export default router;
