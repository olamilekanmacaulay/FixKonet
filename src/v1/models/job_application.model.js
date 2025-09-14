const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
    jobId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", required: true 
    },
    artisanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true 
    },
    status: { 
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);