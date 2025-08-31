import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedTags: [],
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 10
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSelectedTags: (state, action) => {
            state.selectedTags = action.payload;
            state.currentPage = 1; // Reset to first page when filters change
        },
        addTag: (state, action) => {
            if (!state.selectedTags.includes(action.payload)) {
                state.selectedTags.push(action.payload);
                state.currentPage = 1;
            }
        },
        removeTag: (state, action) => {
            state.selectedTags = state.selectedTags.filter(tag => tag !== action.payload);
            state.currentPage = 1;
        },
        clearTags: (state) => {
            state.selectedTags = [];
            state.currentPage = 1;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
            state.currentPage = 1;
        },
        resetFilters: (state) => {
            return initialState;
        }
    }
});

export const {
    setSelectedTags,
    addTag,
    removeTag,
    clearTags,
    setSearchQuery,
    setCurrentPage,
    setItemsPerPage,
    resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;