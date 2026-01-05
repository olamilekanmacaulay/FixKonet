const { requestLoginOtp, verifyLoginOtp } = require('../modules/auth/auth.controller');
const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const SMSService = require('../utils/send_sms');

// Mock Mongoose models
jest.mock('../models/user.model');
jest.mock('../models/otp.model');

// Mock SMS Service (auto-mock)
jest.mock('../utils/send_sms');

// Mock OTP generation
const mockGeneratedOtp = { otp: '123456', hashedOtp: 'hashed123' };
OTP.generateOTP = jest.fn().mockReturnValue(mockGeneratedOtp);

describe('requestLoginOtp Controller', () => {
  let mockRequest;
  let mockResponse;
  let smsInstance;

  beforeAll(() => {
    // Capture the singleton instance. 
    // Since auth.controller is required at top level, the singleton is already created.
    // We access it here to ensure we have a reference that persists even if mock.instances is accessed later.
    // Note: jest.clearAllMocks() wipes mock.instances, so we MUST capture this before any clearAllMocks is called.
    if (SMSService.mock && SMSService.mock.instances && SMSService.mock.instances.length > 0) {
      smsInstance = SMSService.mock.instances[0];
    } else {
      // Fallback or debug logic if instance is missing
      console.warn("SMSService instance not found in mock.instances!");
    }
  });

  beforeEach(() => {
    // Manually clear mocks instead of clearAllMocks to avoid losing the singleton reference if we hadn't captured it (though we did).
    // But clearAllMocks also clears call history on the singleton's methods, which we WANT.
    // Since we captured the object in 'smsInstance', clearAllMocks won't destroy our reference to it.
    // So we can use clearAllMocks safely as long as we use 'smsInstance' variable, not SMSService.mock.instances[0].
    jest.clearAllMocks();

    mockRequest = {
      body: {
        phoneNumber: '+2341567890',
        role: 'artisan',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should create a new user, generate an OTP, and send a success response', async () => {
    User.findOne.mockResolvedValue(null);
    const newUserId = 'new-user-id';
    const newUser = { _id: newUserId, phoneNumber: '+2341567890', roles: ['artisan'] };
    User.create.mockResolvedValue(newUser);

    await requestLoginOtp(mockRequest, mockResponse);

    expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '+2341567890' });
    expect(User.create).toHaveBeenCalledWith({ phoneNumber: '+2341567890', roles: ['artisan'] });
    expect(OTP.generateOTP).toHaveBeenCalled();
    expect(OTP.create).toHaveBeenCalledWith({ userId: newUserId, otp: mockGeneratedOtp.hashedOtp });

    // Verify SMS sent using captured instance
    if (smsInstance) {
      expect(smsInstance.sendOTP).toHaveBeenCalledWith('+2341567890', '123456');
    } else {
      throw new Error("SMS Instance was not captured correctly");
    }

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'OTP sent successfully',
      phoneNumber: '+2341567890',
      roles: ['artisan']
    });
  });

  it('should ADD new role for an existing user if different', async () => {
    const existingUserId = 'existing-user-id';
    const existingUser = {
      _id: existingUserId,
      phoneNumber: '+2341567890',
      roles: ['client'],
      save: jest.fn(),
    };
    User.findOne.mockResolvedValue(existingUser);

    await requestLoginOtp(mockRequest, mockResponse);

    expect(User.findOne).toHaveBeenCalledWith({ phoneNumber: '+2341567890' });

    // Should add 'artisan' to roles since request is for 'artisan'
    expect(existingUser.roles).toContain('artisan');
    expect(existingUser.save).toHaveBeenCalled();

    expect(OTP.generateOTP).toHaveBeenCalled();
    expect(OTP.create).toHaveBeenCalledWith({ userId: existingUserId, otp: mockGeneratedOtp.hashedOtp });

    if (smsInstance) {
      expect(smsInstance.sendOTP).toHaveBeenCalledWith('+2341567890', '123456');
    }

    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if phone number is missing', async () => {
    mockRequest.body.phoneNumber = undefined;
    await requestLoginOtp(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Phone number and role are required' });
  });

  it('should return 400 if role is missing', async () => {
    mockRequest.body.role = undefined;
    await requestLoginOtp(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});

describe('verifyLoginOtp', () => {
  let mockRequest, mockResponse;
  beforeEach(() => {
    mockRequest = { body: { phoneNumber: '123', otp: '123' } };
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should exist', () => {
    expect(verifyLoginOtp).toBeDefined();
  });
});