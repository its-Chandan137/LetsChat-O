import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  selectedConversation: null, // conversation object
  loading: false,
  error: null,
};

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const idx = state.conversations.findIndex(c => c._id === conversationId);
      if (idx !== -1) {
        state.conversations[idx].lastMessage = {
          text: message.content,
          sender: message.sender,
          timestamp: message.createdAt,
        };
        // Move this conversation just below the group chat (index 1), unless it's the group chat (index 0)
        if (idx > 0) {
          const [conv] = state.conversations.splice(idx, 1);
          state.conversations.splice(1, 0, conv);
        }
      }
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  setLoading,
  setError,
  updateConversationLastMessage,
} = conversationsSlice.actions;

export default conversationsSlice.reducer; 