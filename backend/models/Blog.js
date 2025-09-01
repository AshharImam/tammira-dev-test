
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    sub_title: {
        type: String,
        trim: true,
        default: ''
    },
    content: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    modified_date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update modified_date on save
blogSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.modified_date = new Date();
    }
    next();
});

// Create slug from title if not provided
blogSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);