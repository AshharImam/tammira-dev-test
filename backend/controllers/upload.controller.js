const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload single image
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../uploads');
        try {
            await fs.access(uploadsDir);
        } catch {
            await fs.mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = req.file.originalname;
        const extension = path.extname(originalName);
        const filename = `${timestamp}-${Math.random().toString(36).substring(2)}${extension}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        await fs.writeFile(filepath, req.file.buffer);

        // Return file URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

        res.json({
            success: true,
            data: {
                filename,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            },
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};

// Delete image
const deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(__dirname, '../uploads', filename);

        try {
            await fs.access(filepath);
            await fs.unlink(filepath);

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } catch {
            res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
};

module.exports = {
    upload: upload.single('image'),
    uploadImage,
    deleteImage
};