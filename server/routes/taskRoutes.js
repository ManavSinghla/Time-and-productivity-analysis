import express from "express";
import {
    createTask,
    getTasks,
    deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.delete("/:id", deleteTask);

export default router;