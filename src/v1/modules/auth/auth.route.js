const express = require('express');
const router = express.Router();
const { requestLoginOtp, logout, verifyLoginOtp } = require('./auth.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

router.post('/logout', requireAuth, logout);
router.post('/request-login-otp', requestLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);

module.exports = router;