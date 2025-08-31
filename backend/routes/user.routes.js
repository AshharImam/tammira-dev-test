const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser
} = require('../controllers/user.controller');

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get single user
router.get('/:id', getUserById);

// POST /api/users - Create new user
router.post('/', createUser);

module.exports = router;