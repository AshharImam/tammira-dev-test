const express = require('express');
const router = express.Router();
const {
    upload,
    uploadImage,
    deleteImage
} = require('../controllers/upload.controller');
const { auth } = require('../middleware/auth.middleware');

// POST /api/upload/image - Upload single image
router.post('/image', auth, upload, uploadImage);

// DELETE /api/upload/image/:filename - Delete image
router.delete('/image/:filename', auth, deleteImage);

module.exports = router;