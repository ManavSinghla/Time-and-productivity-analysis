import User from "../models/user.js";
import Task from "../models/task.js";
import Goal from "../models/goal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
};

// LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
};

// GET CURRENT USER
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    
    if (req.body.preferences) {
      user.preferences.defaultCategory = req.body.preferences.defaultCategory || user.preferences.defaultCategory;
      user.preferences.dailyGoal = req.body.preferences.dailyGoal || user.preferences.dailyGoal;
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      preferences: updatedUser.preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ACCOUNT

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete associated data
    await Task.deleteMany({ user: req.user });
    await Goal.deleteMany({ user: req.user });
    
    // Delete user
    await user.deleteOne();
    
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD FRIEND BY EMAIL
export const addFriend = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const friendUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!friendUser) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    if (friendUser._id.toString() === req.user.toString()) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    const currentUser = await User.findById(req.user);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.friends.includes(friendUser._id)) {
      return res.status(400).json({ message: "User is already your friend" });
    }

    currentUser.friends.push(friendUser._id);
    await currentUser.save();

    // Mutual addition for seamless mutual leaderboard comparison
    if (!friendUser.friends.includes(currentUser._id)) {
      friendUser.friends.push(currentUser._id);
      await friendUser.save();
    }

    res.json({ message: `Successfully added ${friendUser.name} as a friend!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LEADERBOARD
export const getLeaderboard = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user).populate("friends", "name email");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const usersToCompare = [
      { id: currentUser._id, name: currentUser.name + " (You)", isUser: true },
      ...currentUser.friends.map(f => ({ id: f._id, name: f.name, isUser: false }))
    ];

    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const leaderboardData = await Promise.all(usersToCompare.map(async (u) => {
      const tasks = await Task.find({
        user: u.id,
        date: { $gte: startOfWeek }
      });

      const totalMinutes = tasks.reduce((sum, task) => sum + task.timeSpent, 0);
      const activeDays = new Set(tasks.map(t => new Date(t.date).toDateString()));

      return {
        id: u.id,
        name: u.name,
        score: totalMinutes,
        streak: activeDays.size,
        isUser: u.isUser
      };
    }));

    leaderboardData.sort((a, b) => b.score - a.score);

    const rankedLeaderboard = leaderboardData.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};