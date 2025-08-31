// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import blogReducer from './blogSlice';
import filterReducer from './filterSlice';
import authReducer from './authSlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['filters', 'auth'] // Only persist filters
};

const rootReducer = combineReducers({
    blogs: blogReducer,
    filters: filterReducer,
    auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);