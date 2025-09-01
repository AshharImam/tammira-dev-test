import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from 'src/services/blogService';
// Async thunks
export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async ({ page = 1, limit = 10, tags = '', search = '' }, { rejectWithValue }) => {
        try {
            const response = await blogService.getBlogs({ page, limit, tags, search });
            console.log(JSON.stringify(response, null, 2));

            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
        }
    }
);

export const fetchBlogById = createAsyncThunk(
    'blogs/fetchBlogById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await blogService.getBlogById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
        }
    }
);

export const updateBlog = createAsyncThunk(
    'blogs/updateBlog',
    async ({ id, blogData }, { rejectWithValue }) => {
        try {
            const response = await blogService.updateBlog(id, blogData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
        }
    }
);

const initialState = {
    blogs: [],
    currentBlog: null,
    pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        items_per_page: 10,
        has_next: false,
        has_prev: false
    },
    loading: false,
    error: null,
    refreshing: false
};

const blogSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        },
        setRefreshing: (state, action) => {
            state.refreshing = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch blogs
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.blogs = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                state.error = action.payload;
            })
            // Fetch single blog
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBlog = action.payload.data;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update blog
            .addCase(updateBlog.fulfilled, (state, action) => {
                const updatedBlog = action.payload;
                const index = state.blogs.findIndex(blog => blog._id === updatedBlog._id);
                if (index !== -1) {
                    state.blogs[index] = updatedBlog;
                }
                if (state.currentBlog?._id === updatedBlog._id) {
                    state.currentBlog = updatedBlog;
                }
            });
    }
});

export const { clearError, clearCurrentBlog, setRefreshing } = blogSlice.actions;
export default blogSlice.reducer;