const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "true"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    budget: {
        type: Number
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "completed","cancelled"],
        default: "open"
    },
    createdAt: { 
            type: Date,
            default: Date.now 
    },
    updatedAt: { 
            type: Date,
            default: Date.now 
    }
});

module.exports = mongoose.model("Job", jobSchema);
