const User = require('../models/User');
const Joi = require('joi');

// Validation schema for user profile update
const updateProfileSchema = Joi.object({
    first_name: Joi.string().trim(),
    last_name: Joi.string().trim(),
    bio: Joi.string().allow('').trim(),
    profile_pic_url: Joi.string().uri().allow('')
});

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -__v')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -__v');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.details[0].message
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            value,
            { new: true, runValidators: true }
        ).select('-password -__v');

        res.json({
            success: true,
            data: user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateProfile,
    deleteAccount
};