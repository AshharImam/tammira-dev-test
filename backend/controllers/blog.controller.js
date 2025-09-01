// controllers/blogController.js
const Blog = require('../models/Blog');
const User = require('../models/User');
const Joi = require('joi');

// Validation schema for blog creation/update
const blogSchema = Joi.object({
  title: Joi.string().required().trim(),
  sub_title: Joi.string().allow('').trim(),
  content: Joi.string().required(),
  slug: Joi.string().trim(),
  tags: Joi.array().items(Joi.string().trim()),
  author: Joi.string().required()
});

// Get blogs with pagination and filtering
const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tags = req.query.tags;
    const search = req.query.search;
    
    // Build query
    let query = {};
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sub_title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name bio profile_pic_url')
      .sort({ created_date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'first_name last_name bio profile_pic_url');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// Create new blog
const createBlog = async (req, res) => {
  try {
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }
    
    // Check if author exists
    const author = await User.findById(value.author);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }
    
    const blog = new Blog(value);
    await blog.save();
    
    await blog.populate('author', 'first_name last_name bio profile_pic_url');
    
    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Blog with this slug already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creating blog',
        error: error.message
      });
    }
  }
};

// Update blog by ID
const updateBlog = async (req, res) => {
  try {
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...value, modified_date: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'first_name last_name bio profile_pic_url');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      data: blog,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
};

// Delete blog by ID
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};