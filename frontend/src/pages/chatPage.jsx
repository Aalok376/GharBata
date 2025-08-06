import React, { useState, useEffect, useRef } from 'react'
import {
    FaPaperPlane,
    FaEllipsisH,
    FaPen,
    FaTrash,
    FaHome,
    FaComments
} from 'react-icons/fa'

const MessagingApp = () => {
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [messageInput, setMessageInput] = useState('')
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [editingMessage, setEditingMessage] = useState(null)
    const [editText, setEditText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const messagesEndRef = useRef(null)
    const editInputRef = useRef(null)

    const socket = useRef(null)

    useEffect(() => {
        if (socket.current?.connected) {
            return
        }

        fetchConversations()

        const initSocket = async () => {
            try {
                if (socket.current) {
                    socket.current.disconnect()
                }

                const { io } = await import('https://cdn.socket.io/4.4.1/socket.io.esm.min.js')

                socket.current = io("https://gharbata.onrender.com", {
                    withCredentials: true,
                    reconnection: true,
                    reconnectionAttempts: 20,
                    reconnectionDelay: 500,
                    reconnectionDelayMax: 1000,
                    randomizationFactor: 0
                })

                socket.current.on('connect', () => {
                    console.log('Connected to server with ID:', socket.current.id)
                })

                socket.current.on('disconnect', () => {
                    console.log('Disconnected from server')
                })

                socket.current.on('textMessage', handleNewMessage)
                socket.current.on('editedMessage', handleEditedMessage)
                socket.current.on('detetedMessage', handleDeletedMessage)
            } catch (error) {
                console.error('Error initializing socket:', error)
            }
        }

        initSocket()

        return () => {
            if (socket.current) {
                socket.current.disconnect()
                socket.current = null
            }
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (editingMessage && editInputRef.current) {
            editInputRef.current.focus()
        }
    }, [editingMessage])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchConversations = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('https://gharbata.onrender.com/api/chats/getConversations', {
                method: 'GET',
                credentials: 'include',
            })

            if (response.status === 404) {
                // Handle "no conversations found" case - this is not an error
                const data = await response.json()
                setConversations([])
                // Don't set an error for this case, it's a normal state
                console.log('No conversations found')
                return
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            console.log('Conversations response:', data)

            setConversations(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching conversations:', error)
            setError('Failed to load conversations. Please check if the server is running.')
            setConversations([])
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId) => {
        try {
            setLoading(true)
            const response = await fetch(`https://gharbata.onrender.com/api/chats/getMessage/${conversationId}`, {
                method: "GET",
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setMessages(data.conversation?.messages || [])
            setCurrentUser(data.userId)

            const participants = data.conversation?.participants || []
            const otherParticipant = participants.find(p => p._id.toString() !== data.userId)
            setSelectedConversation({
                ...data.conversation,
                otherParticipant
            })
        } catch (error) {
            console.error('Error fetching messages:', error)
            setError('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    // Socket event handlers
    const handleNewMessage = (data) => {
        const message = data.newMessage
        const messageId = data.messageId

        setMessages(prev => [...prev, { ...message, _id: messageId }])
    }

    const handleEditedMessage = (data) => {
        const { messageId, newMessageText } = data

        setMessages(prev => prev.map(msg =>
            msg._id === messageId ? { ...msg, message: newMessageText } : msg
        ))
        console.log(`Message ${messageId} updated from socket`)
    }

    const handleDeletedMessage = (data) => {
        const { messageId } = data

        setMessages(prev => prev.filter(msg => msg._id !== messageId))
        console.log(`Message ${messageId} removed from socket`)
    }

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return

        try {
            const response = await fetch('https://gharbata.onrender.com/api/chats/sendMessage', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiverId: selectedConversation.otherParticipant._id,
                    message: messageInput
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                const newMessage = {
                    ...data.newMessage,
                    _id: data.messageId
                }
                setMessages(prev => [...prev, newMessage])
                setMessageInput('')
                fetchConversations() // Refresh conversations list
            }
        } catch (error) {
            console.error('Error sending message:', error)
            setError('Failed to send message')
        }
    }

    const editMessage = async (messageId, newText) => {
        if (!newText.trim()) return

        try {
            const response = await fetch('https://gharbata.onrender.com/api/chats/editMessage', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    messageId,
                    conversationId: selectedConversation._id,
                    newMessageText: newText
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, message: newText } : msg
            ))
            setEditingMessage(null)
            setEditText('')
        } catch (error) {
            console.error('Error editing message:', error)
            setError('Failed to edit message')
        }
    }

    const deleteMessage = async (messageId) => {
        try {
            const response = await fetch(
                `https://gharbata.onrender.com/api/chats/removeMessage/${selectedConversation._id}/${messageId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setMessages(prev => prev.filter(msg => msg._id !== messageId))
            setActiveDropdown(null)
        } catch (error) {
            console.error('Error deleting message:', error)
            setError('Failed to delete message')
        }
    }

    const handleConversationClick = (conversation) => {
        fetchMessages(conversation._id)
        setActiveDropdown(null)
        setError(null)
    }

    const handleKeyPress = (e, action, ...args) => {
        if (e.key === 'Enter') {
            action(...args)
        }
    }

    const startEditing = (message) => {
        setEditingMessage(message._id)
        setEditText(message.message)
        setActiveDropdown(null)
    }

    const cancelEditing = () => {
        setEditingMessage(null)
        setEditText('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-16 flex items-center justify-between px-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <FaHome className="text-white text-lg" />
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        GharBata
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                    <FaComments className="text-lg" />
                    <span className="text-sm font-medium">Messaging</span>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex h-screen pt-16">
                {/* Conversations list */}
                <div className="w-full md:w-96 bg-white shadow-xl overflow-hidden border-r">
                    <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FaComments className="mr-2 text-blue-600" />
                            Chats
                        </h2>
                    </div>
                    <div className="overflow-y-auto h-full pb-20">
                        {loading && conversations.length === 0 ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Loading conversations...</span>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">
                                <FaComments className="mx-auto text-4xl mb-3 text-gray-300" />
                                <p>No conversations yet</p>
                                <p className="text-sm">Start a new conversation!</p>
                            </div>
                        ) : (
                            conversations.map((conversation) => (
                                <div
                                    key={conversation._id}
                                    onClick={() => handleConversationClick(conversation)}
                                    className="flex items-center p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100 hover:border-blue-200"
                                >
                                    <div
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mr-4 bg-cover bg-center border-2 border-white shadow-md flex-shrink-0"
                                        style={{
                                            backgroundImage: `url(${conversation.otherParticipant?.profilePic})`
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 truncate">
                                            {conversation.otherParticipant?.fname} {conversation.otherParticipant?.lname}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                            Click to view messages
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 bg-white shadow-xl flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat header */}
                            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
                                <div className="flex items-center">
                                    <div
                                        className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mr-4 bg-cover bg-center border-2 border-white shadow-md flex-shrink-0"
                                        style={{
                                            backgroundImage: `url(${selectedConversation.otherParticipant?.profilePic})`
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <div className="font-semibold text-gray-800 truncate">
                                            {selectedConversation.otherParticipant?.fname} {selectedConversation.otherParticipant?.lname}
                                        </div>
                                    </div>
                                </div>  
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#f8fafc' }}>
                                {loading && messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading messages...</span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <FaComments className="mx-auto text-4xl mb-3 text-gray-300" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Start the conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isMyMessage = message.senderId === currentUser
                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl relative flex items-start gap-2 ${isMyMessage
                                                    ? 'flex-row'
                                                    : 'flex-row'
                                                    }`}>
                                                    {/* Three dots menu - positioned before the message */}
                                                    {isMyMessage && (
                                                        <div className="flex items-center pt-2">
                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setActiveDropdown(activeDropdown === message._id ? null : message._id)}
                                                                    className="p-2 hover:bg-gray-200 hover:bg-opacity-50 rounded-full transition-colors"
                                                                >
                                                                    <FaEllipsisH size={12} className="text-gray-600" />
                                                                </button>

                                                                {activeDropdown === message._id && (
                                                                    <div className="absolute top-10 left-0 bg-white rounded-lg shadow-xl border py-2 z-10 min-w-max">
                                                                        <button
                                                                            onClick={() => startEditing(message)}
                                                                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 w-full text-left text-gray-700"
                                                                        >
                                                                            <FaPen size={12} className="text-blue-600" /> Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteMessage(message._id)}
                                                                            className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
                                                                        >
                                                                            <FaTrash size={12} /> Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Message bubble */}
                                                    <div className={`${isMyMessage
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-l-2xl rounded-tr-2xl shadow-lg'
                                                        : 'bg-white border border-gray-200 rounded-r-2xl rounded-tl-2xl shadow-md'
                                                        } p-4`}>
                                                        {editingMessage === message._id ? (
                                                            <input
                                                                ref={editInputRef}
                                                                type="text"
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        editMessage(message._id, editText)
                                                                    } else if (e.key === 'Escape') {
                                                                        cancelEditing()
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    if (editText.trim()) {
                                                                        editMessage(message._id, editText)
                                                                    } else {
                                                                        cancelEditing()
                                                                    }
                                                                }}
                                                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                                                            />
                                                        ) : (
                                                            <div className="break-words">{message.message}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message input */}
                            <div className="p-4 border-t bg-white">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, sendMessage)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!messageInput.trim()}
                                        className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                                    >
                                        <FaPaperPlane className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-blue-50 to-indigo-100">
                            <div className="text-center">
                                <FaComments className="mx-auto text-6xl mb-4 text-gray-300" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">Welcome to GharBata</h3>
                                <p className="text-gray-500">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile responsive adjustments */}
            <style>{`
        @media (max-width: 768px) {
          .flex.h-screen.pt-16 {
            flex-direction: column;
            height: calc(100vh - 4rem);
          }
          
          .md\\:w-96 {
            width: 100% !important;
            height: 35vh;
            min-height: 250px;
            max-height: 300px;
          }
          
          .flex-1.bg-white.shadow-xl.flex.flex-col {
            height: 65vh;
            min-height: 400px;
          }
          
          .overflow-y-auto.h-full.pb-20 {
            padding-bottom: 1rem;
          }
          
          .p-4 {
            padding: 0.75rem;
          }
          
          .p-5 {
            padding: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .md\\:w-96 {
            height: 30vh;
            min-height: 200px;
          }
          
          .flex-1.bg-white.shadow-xl.flex.flex-col {
            height: 70vh;
          }
          
          .max-w-xs {
            max-width: 85%;
          }
          
          .md\\:max-w-md {
            max-width: 85%;
          }
          
          .lg\\:max-w-lg {
            max-width: 85%;
          }
          
          .xl\\:max-w-xl {
            max-width: 85%;
          }
          
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          
          .py-3 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          
          .p-3 {
            padding: 0.5rem;
          }
          
          .gap-3 {
            gap: 0.5rem;
          }
        }
      `}</style>
        </div>
    )
}

export default MessagingApp