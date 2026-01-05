const User = require("../../models/user.model");
const OTP = require("../../models/otp.model");

const SMSService = require("../../utils/send_sms");
const smsService = new SMSService();

exports.requestLoginOtp = async (req, res) => {
    try {
        const { phoneNumber, role } = req.body;
        // validate input
        if (!phoneNumber || !role) {
            return res.status(400).json({ message: "Phone number and role are required" });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ phoneNumber });

        if (!existingUser) {
            // If user does not exist, create a new one with the selected role.
            existingUser = await User.create({ phoneNumber, roles: [role] });
        } else {
            // User exists. Check if they have the requested role.
            if (role && !existingUser.roles.includes(role)) {
                existingUser.roles.push(role);
                await existingUser.save();
            }
        }

        // Generate OTP
        const { otp, hashedOtp } = OTP.generateOTP();

        // Save the hashed OTP to the database, linked to the user
        await OTP.create({ userId: existingUser._id, otp: hashedOtp });

        // Send OTP
        try {
            await smsService.sendOTP(phoneNumber, otp);
        } catch (smsError) {
            console.error("Failed to send OTP:", smsError);
            return res.status(500).json({ message: "Failed to send OTP via SMS." });
        }

        res.status(200).json({
            message: "OTP sent successfully",
            phoneNumber: existingUser.phoneNumber,
            roles: existingUser.roles
        });
    } catch (error) {
        console.error("Error in onboardController:", error);
        res.status(500).json({ message: "Internal server error. Please try again" });
    }
};


exports.verifyLoginOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        // Validate input
        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required." });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ phoneNumber });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found. Please sign up first." });
        }

        // Find the most recent unused OTP for the user
        const otpRecord = await OTP.findOne({ userId: existingUser._id, isUsed: false }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "OTP is invalid or has expired. Please request a new one." });
        }

        // verify otp
        const isMatch = await otpRecord.verifyOTP(otp);
        if (!isMatch) {
            return res.status(400).json({ message: "The OTP you entered is incorrect." });
        }

        // Mark the user as verified
        existingUser.isVerified = true;
        await existingUser.save();

        //mark the otp as used as well
        otpRecord.isUsed = true;
        await otpRecord.save();

        //save user data to session
        // Determine active role
        const requestedRole = req.body.role;
        const activeRole = (requestedRole && existingUser.roles.includes(requestedRole))
            ? requestedRole
            : existingUser.roles[0];

        req.session.user = {
            id: existingUser._id,
            phoneNumber: existingUser.phoneNumber,
            roles: existingUser.roles,
            activeRole: activeRole
        };

        res.status(200).json({
            success: true,
            message: "Login successful!",
            sessionId: req.session.id,
            user: req.session.user,
            role: activeRole
        });
    } catch (error) {
        console.error("Error in verifyLoginOtp:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
}

exports.logout = async (req, res) => {
    try {
        // Destroy the session from Redis and clear the cookie
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ message: "Could not log out." });
            }

            res.clearCookie('sessionId');
            res.status(200).json({
                success: true,
                message: "Logged out successfully."
            });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};
