import React, { useEffect, useState } from 'react'
import chatService from '../api/chat'

const ChatBox = ({ bookingId, userId }) => {
  const [chat, setChat] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')


  useEffect(() => {
    const fetchChat = async () => {
      try {
        const data = await chatService.getChat(bookingId)
        if (!data) {
          const newChat = await chatService.createChat(bookingId, [userId, technicianId])
          setChat(newChat)
        } else {
          setChat(data)
        }
    } catch (error) {
      console.error('Failed to fetch chat:', error)
    } finally {
      setLoading(false)
      }
    }

    fetchChat()
  }, [bookingId])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      const updatedChat = await chatService.sendMessage(bookingId, userId, message)
      setChat(updatedChat)
      setMessage('')
    } catch (error) {
      setError(error.message || 'Something went wrong')
    }
  }

  const chatEndRef = useRef(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat?.messages])


  if (loading) return <p>Loading chat...</p>

  return (
    <div className="chat-container" style={{ border: '1px solid #ccc', padding: '1rem', width: '100%', maxWidth: '600px', margin: 'auto' }}>
      <h3>Chat</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid #eee', padding: '0.5rem' }}>
        {chat?.messages?.length > 0 ? (
          chat.messages.map((msg, idx) => (
            <div key={idx}
              style={{
                marginBottom: '0.5rem',
                padding: '0.5rem',
                backgroundColor: msg.senderId?._id === userId ? '#e0f7fa' : '#f1f1f1',
                borderRadius: '8px',
              }}
            >
              <strong>{msg.senderId?.username || 'Unknown'}:</strong> {msg.message}
              <div style={{ fontSize: '0.75rem', color: 'gray' }}>{new Date(msg.timestamp).toLocaleString()}</div>
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
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={sending || !message.trim()}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default ChatBox
