import React, { useEffect, useState, useRef } from 'react';
import chatService from '../api/chat';

const ChatBox = ({ bookingId, userId, technicianId }) => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  // Fetch or create chat on mount or when bookingId changes
  useEffect(() => {
    const fetchChat = async () => {
      try {
        console.log('Fetching chat for bookingId:', bookingId);
        const data = await chatService.getChat(bookingId);
        if (!data || !data._id) {
          console.log('No chat found, creating new chat');
          const newChat = await chatService.createChat(bookingId, [userId, technicianId]);
          setChat(newChat);
        } else {
          setChat(data);
        }
      } catch (error) {
        console.error('Failed to fetch chat:', error);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && userId && technicianId) {
      fetchChat();
    }
  }, [bookingId, userId, technicianId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;  // Prevent sending empty messages
    setSending(true);
    setError('');
    try {
      const updatedChat = await chatService.sendMessage(bookingId, userId, message);
      setChat(updatedChat);
      setMessage('');
    } catch (error) {
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  console.log('ChatBox render:', { chat, loading, error });

  if (loading) return <p>Loading chat...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!chat) return <p>No chat data available.</p>;

  return (
    <div
      className="chat-container"
      style={{
        border: '1px solid #ccc',
        padding: '1rem',
        width: '100%',
        maxWidth: '600px',
        margin: 'auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
    >
      <h3>Chat</h3>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '1rem',
          border: '1px solid #eee',
          padding: '0.5rem',
          backgroundColor: '#fafafa',
          borderRadius: '4px',
        }}
      >
        {chat.messages.length > 0 ? (
          chat.messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                backgroundColor: msg.senderId?._id === userId ? '#e0f7fa' : '#f1f1f1',
                borderRadius: '8px',
                textAlign: msg.senderId?._id === userId ? 'right' : 'left',
              }}
            >
              <strong>{msg.senderId?.username || 'Unknown'}:</strong> {msg.message}
              <div style={{ fontSize: '0.75rem', color: 'gray' }}>
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={sending || !message.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
