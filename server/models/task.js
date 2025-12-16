import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String
        },
        timeSpent: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            enum: ["Study", "Work", "Personal", "Other"],
            default: "Other"
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
