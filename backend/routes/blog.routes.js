// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blog.controller');

// GET /api/blogs - List blogs with pagination and filtering
router.get('/', getBlogs);

// GET /api/blogs/:id - Get single blog
router.get('/:id', getBlogById);

// POST /api/blogs - Create new blog
router.post('/', createBlog);

// PUT /api/blogs/:id - Update blog
router.put('/:id', updateBlog);

// DELETE /api/blogs/:id - Delete blog
router.delete('/:id', deleteBlog);

module.exports = router;