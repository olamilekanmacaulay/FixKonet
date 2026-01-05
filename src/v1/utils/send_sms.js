const config = require('../config/vars');
const twilio = require('twilio');

class SMSService {
    constructor() {
        this.twilioClient = twilio(
            config.sms.twilioSid,
            config.sms.twilioAuthToken
        );
    }

    async sendOTP(phoneNumber, otp) {
        try {
            const message = await this.twilioClient.messages.create({
                body: `Your verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
                from: config.sms.twilioPhoneNumber,
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
