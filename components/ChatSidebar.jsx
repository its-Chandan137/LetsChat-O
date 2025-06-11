import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setConversations, setSelectedConversation } from '../store/slices/conversationsSlice';
import { setUsers } from '../store/slices/userSlice';
import styles from '../styles/ChatSidebar.module.scss';

export default function ChatSidebar() {
  const dispatch = useDispatch();
  const { conversations, selectedConversation } = useSelector((state) => state.conversations);
  const { users } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/conversations', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          dispatch(setConversations(data));
        } else {
          dispatch(setConversations([]));
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    fetchConversations();
  }, [dispatch, user.id]);

  // Fetch all users except current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          dispatch(setUsers(data));
        } else {
          dispatch(setUsers([]));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [dispatch, user.id]);

  // Helper: find private conversation with a user
  const findPrivateConversation = (userId) => {
    return conversations.find(
      (conv) => conv.type === 'private' && conv.members.some((m) => m._id === userId)
    );
  };

  // Handle selecting group chat
  const handleSelectGroup = () => {
    const groupConv = conversations.find((c) => c.type === 'group');
    if (groupConv) dispatch(setSelectedConversation(groupConv));
  };

  // Handle selecting a user for private chat
  const handleSelectUser = async (otherUser) => {
    let privateConv = findPrivateConversation(otherUser.id);
    if (privateConv) {
      dispatch(setSelectedConversation(privateConv));
    } else {
      // Create new private conversation
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ userId: otherUser.id }),
        });
        const data = await res.json();
        if (data && data._id) {
          dispatch(setConversations([conversations[0], data, ...conversations.slice(1)]));
          dispatch(setSelectedConversation(data));
        }
      } catch (error) {
        console.error('Error creating private conversation:', error);
      }
    }
  };

  // Group chat pinned on top
  const groupConv = conversations.find((c) => c.type === 'group');

  return (
    <div className={styles.sidebar}>
      <div className={`${styles.header} ${styles['sidebar-header']}`}>
        <h2 className={`${styles['sidebar-heading']}`}>Users</h2>
      </div>
      <div className={styles.userList}>
        {groupConv && (
          <div
            key={groupConv._id}
            className={`${styles.userItem} ${selectedConversation && selectedConversation._id === groupConv._id ? styles.selected : ''}`}
            onClick={handleSelectGroup}
          >
            <div className={styles.avatar}>G</div>
            <div className={styles.userInfo}>
              <h3>Group Chat</h3>
              <p>All users</p>
              {groupConv.lastMessage && (
                <span className={styles.lastMessage}>{groupConv.lastMessage.text}</span>
              )}
            </div>
          </div>
        )}


        <div className={styles.separatorContainer}>
              <div>All Users</div><div className={styles.separator}></div>
        </div>

        {/* List all users for private chat */}
        {users.map((u) => (
          <div
            key={u.id}
            className={`${styles.userItem} ${
              selectedConversation &&
              selectedConversation.type === 'private' &&
              selectedConversation.members.some((m) => m._id === u.id)
                ? styles.selected
                : ''
            }`}
            onClick={() => handleSelectUser(u)}
          >
            <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <h3>{u.name}</h3>
              <p>{u.email}</p>
              {/* Show last message if exists */}
              {(() => {
                const conv = findPrivateConversation(u.id);
                return conv && conv.lastMessage ? (
                  <span className={styles.lastMessage}>{conv.lastMessage.text}</span>
                ) : null;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 