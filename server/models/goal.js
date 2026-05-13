import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ["Study", "Work", "Personal", "Other", "All"], 
        required: true 
    },
    targetTime: { 
        type: Number, 
        required: true 
    }, // in minutes
    timeframe: { 
        type: String, 
        enum: ["daily", "weekly"], 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["min", "max"], 
        default: "min" 
    } // "min" means achieve at least this much. "max" means don't exceed this.
}, { timestamps: true });

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
