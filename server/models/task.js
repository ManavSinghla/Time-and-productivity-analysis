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
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        recurrence: {
            type: {
                type: String,
                enum: ["none", "daily", "weekly"],
                default: "none"
            },
            days: [{
                type: Number
            }]
        },
        subTasks: [
            {
                title: {
                    type: String,
                    required: true
                },
                completed: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
