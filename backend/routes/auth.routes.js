const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    changePassword
} = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/profile - Get current user profile
router.get('/profile', auth, getProfile);

// PUT /api/auth/change-password - Change password
router.put('/change-password', auth, changePassword);

module.exports = router;