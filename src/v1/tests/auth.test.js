const User = require('@models/user.model');
const OTP = require('@models/otp.model');
const { requestLoginOtp, verifyLoginOtp,logout } = require('../auth.controller');
const { authPublisher } = require('../modules/auth/auth.publisher');


const req = { 
    body: {
        phoneNumber: '+2349020700831',
        role: 'artisan'
    }
};
const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

it('')
jest.mock('@models/user.model');

