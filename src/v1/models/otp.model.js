const mongoose = require("mongoose");
const crypto = require("crypto");

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    otp: {
        type: String,
        required: true
    },
    
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    }
}, { timestamps: true });

// Generate OTP method
otpSchema.statics.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
    
    return { otp, hashedOtp };
};

// Verify OTP method
otpSchema.methods.verifyOTP = function(plainOtp) {
    const hash = crypto
        .createHash('sha256')
        .update(plainOtp)
        .digest('hex');
    return this.otp === hash;
};

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);