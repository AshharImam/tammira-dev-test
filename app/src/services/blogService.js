import ApiService from "./apiService";

class BlogService extends ApiService {

    // Get blogs with filters
    async getBlogs({ page = 1, limit = 10, tags = '', search = '' }) {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (tags) {
            params.append('tags', tags);
        }

        if (search) {
            params.append('search', search);
        }

        const response = await this.api.get(`/blogs?${params.toString()}`);
        return response.data;
    }

    // Get single blog by ID
    async getBlogById(id) {
        const response = await this.api.get(`/blogs/${id}`);
        return response.data;
    }

    // Create new blog
    async createBlog(blogData) {
        const response = await this.api.post('/blogs', blogData);
        return response.data;
    }

    // Update blog
    async updateBlog(id, blogData) {
        const response = await this.api.put(`/blogs/${id}`, blogData);
        return response.data;
    }

    // Delete blog
    async deleteBlog(id) {
        const response = await this.api.delete(`/blogs/${id}`);
        return response.data;
    }

    // Get all users
    async getUsers() {
        const response = await this.api.get('/users');
        return response.data;
    }

    // Health check
    async healthCheck() {
        const response = await this.api.get('/health');
        return response.data;
    }
}

export default new BlogService();