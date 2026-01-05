require('dotenv').config();

module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'secret',
    mongo: {
        uri: process.env.MONGO_URI,
    },
    redis: {
        url: process.env.REDIS_URL,
    },
    sms: {
        twilioSid: process.env.TWILIO_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
        twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    otp: {
        expiry: 15 * 60 * 1000, // 15 minutes
    },
    session: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    clientUrl: process.env.CLIENT_URL || '*',
};
