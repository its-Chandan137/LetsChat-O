import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import userReducer from './slices/userSlice';
import conversationsReducer from './slices/conversationsSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'users', 'messages']
};

const rootReducer = combineReducers({
  auth: authReducer,
  chat: chatReducer,
  users: userReducer,
  conversations: conversationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); 