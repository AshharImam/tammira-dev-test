import ApiService from './apiService';

class AuthService extends ApiService {

    // Login user
    async login(email, password) {
        const response = await this.api.post('/auth/login', { email, password });
        return response.data;
    }

    // Sign up user
    async signup(userData) {
        const response = await this.api.post('/auth/register', userData);
        return response.data;
    }

    // Update profile
    async updateProfile(id, userData) {
        const response = await this.api.put(`/users/${id}`, userData);
        return response.data;
    }

    // Get profile
    async getProfile() {
        const response = await this.api.get(`/auth/profile`,);
        return response.data;
    }

    // Logout
    async logout() {
    }
}

export default new AuthService();