const OTP = require('../models/otp.model');
const User = require('../models/user.model');
const axios = require('axios');
const twilio = require('twilio');

class SMSService {
    constructor() {
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendOTP(phoneNumber, otp) {
        try {
            const message = await this.twilioClient.messages.create({
                body: `Your verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
            return message;
        } catch (error) {
            if (error.code) {
                throw new Error(`Twilio Error ${error.code}: ${error.message}`);
            }
            throw error;
        }
    }
}
   

module.exports = SMSService;
