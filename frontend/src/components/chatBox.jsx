import React, { useEffect, useState } from 'react';
import { getChat, createChat, sendMessage } from '../api/chat';

const ChatBox = ({ bookingId, userId }) => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const data = await getChat(bookingId);
        setChat(data);
      } catch (error) {
        console.error('Failed to fetch chat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [bookingId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const updatedChat = await sendMessage(bookingId, userId, message);
      setChat(updatedChat);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <p>Loading chat...</p>;

  return (
    <div className="chat-container" style={{ border: '1px solid #ccc', padding: '1rem', width: '100%', maxWidth: '600px', margin: 'auto' }}>
      <h3>Chat</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #eee', padding: '0.5rem' }}>
        {chat?.messages?.length > 0 ? (
          chat.messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <strong>{msg.senderId?.username || 'Unknown'}:</strong> {msg.message}
              <div style={{ fontSize: '0.75rem', color: 'gray' }}>{new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
