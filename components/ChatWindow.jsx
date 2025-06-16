import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setMessages, clearMessages } from '../store/slices/chatSlice';
import { updateConversationLastMessage } from '../store/slices/conversationsSlice';
import styles from '../styles/ChatWindow.module.scss';
import MessageInput from './MessageInput';
import { io } from 'socket.io-client';

let socket;

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { messages } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { selectedConversation, conversations } = useSelector((state) => state.conversations);
  const messagesEndRef = useRef(null);

  // Connect to Socket.IO and join rooms for all conversations
  useEffect(() => {
    if (!user || !conversations.length) return;
    if (socket) socket.disconnect();
    const conversationIds = conversations.map(c => c._id).join(',');
    let baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    const isProd = process.env.NODE_ENV === 'production';
    const socketUrl = isProd ? `${baseUrl}/api/socketio` : baseUrl;
    const socketPath = isProd ? '/api/socketio8989' : '/socket.io';
    
    console.log('Socket URL:', socketUrl); // Should end with /api/socketio (no slash after)
    console.log('Socket Path:', socketPath);
    
    socket = io(socketUrl, {
      query: {
        userId: user.id,
        conversationIds,
      },
      path: socketPath, // No trailing slash!
    });
    // Listen for new messages
    socket.on('message', ({ conversationId, message }) => {
      // Only add message if it's for the selected conversation
      if (selectedConversation && conversationId === selectedConversation._id) {
        dispatch(addMessage(message));
      }
      // Always update sidebar for this conversation
      dispatch(updateConversationLastMessage({ conversationId, message }));
    });
    // Join the selected conversation room
    if (selectedConversation) {
      socket.emit('join-conversation', selectedConversation._id);
    }
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [user, conversations.length, selectedConversation && selectedConversation._id]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${selectedConversation._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        dispatch(setMessages(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
    return () => dispatch(clearMessages());
  }, [dispatch, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ conversationId: selectedConversation._id, content }),
      });
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      const message = await res.json();
      // Emit the message to the room for real-time update
      if (socket) {
        socket.emit('message', { conversationId: selectedConversation._id, message });
      }
      // Also update sidebar immediately for sender
      dispatch(updateConversationLastMessage({ conversationId: selectedConversation._id, message }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!selectedConversation) {
    return <div className={styles.chatWindow}><div className={styles.noConversation}>Select a chat to start messaging.</div></div>;
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {(Array.isArray(messages) ? messages : []).map((message) => (
          <div
            key={message._id}
            className={`${styles.message} ${
              message?.sender?._id === user.id ? styles.ownMessage : ''
            }`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.sender}>{message?.sender?.name}</span>
              <span className={styles.time}>
                {new Date(message?.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className={styles.content}>{message?.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
} 