const User = require("../../models/user.model");
const OTP = require("../../models/otp.model");
const AuthPublisher = require("./auth.publisher");

exports.requestLoginOtp = async (req, res ) => {
    try {
        const { phoneNumber, role } = req.body;
        // validate input
        if (!phoneNumber || !role) {
            return res.status(400).json({ message: "Phone number and role are required" });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ phoneNumber });

        if (existingUser) {
            // If user exists, update their role to what they just selected.
            existingUser.role = role;
            await existingUser.save();
        } else {
            // If user does not exist, create a new one with the selected role.
            existingUser = await User.create({ phoneNumber, role });
        }

        // Generate OTP
        const { otp, hashedOtp } = OTP.generateOTP();

        // Save the hashed OTP to the database, linked to the user
        await OTP.create({ userId: existingUser._id, otp: hashedOtp });

        //publish OTP event
        await AuthPublisher.publishOTPRequest({ phoneNumber, otp, userId: existingUser._id });

    

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in onboardController:", error);
        res.status(500).json({ message: "Internal server error. Please try again" });
    }
};


exports.verifyLoginOtp = async (req, res) => {
    try {
        const {phoneNumber, otp } = req.body;
        // Validate input
        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: "Phone number and OTP are required." }); 
        }

        // Check if user already exists
        let existingUser = await user.findOne({ phoneNumber });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found. Please sign up first." });
        }

        // Find the most recent unused OTP for the user
        const otpRecord = await OTP.findOne({ userId: existingUser._id, isUsed: false }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date() ) {
            return res.status(400).json({ message: "OTP is invalid or has expired. Please request a new one." });
        }

        // verify otp
        const isMatch = await otpRecord.verifyOTP(otp);
        if(!isMatch) {
            return res.status(400).json({ message: "The OTP you entered is incorrect." });
        }

        // Mark the user as verified
        existingUser.isVerified = true;
        await existingUser.save();

        //mark the otp as used as well
        otpRecord.isUsed = true;
        await otpRecord.save();

       //save user data to session
       req.session.user = {
        id: existingUser._id,
        phoneNumber: existingUser.phoneNumber,
        role: existingUser.role
       };

        // Respond with success and user info, including the sessionId
        res.status(200).json({
            success: true,
            message: "Login successful!",
            sessionId: req.session.id,
            user: req.session.user
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

            res.clearCookie('connect.sid'); // The default session cookie name
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
