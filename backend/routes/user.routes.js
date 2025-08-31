const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateProfile,
    deleteAccount
} = require('../controllers/user.controller');
const { optionalAuth, auth } = require('../middleware/auth.middleware');

// GET /api/users - Get all users
router.get('/', optionalAuth, getAllUsers);

// GET /api/users/:id - Get single user
router.get('/:id', getUserById);

// PUT /api/users/profile - Update current user profile
router.put('/profile', auth, updateProfile);

// DELETE /api/users/account - Delete current user account
router.delete('/account', auth, deleteAccount);

module.exports = router;