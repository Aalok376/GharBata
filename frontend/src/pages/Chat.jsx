import React from 'react'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Send } from 'lucide-react'
import { io } from 'socket.io-client'

export default function SocketChat({ bookingId, currentUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [connectionError, setConnectionError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      autoConnect: false
    })
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket || !bookingId) return

    socket.connect()
    socket.emit('join_room', bookingId)

    axios
      .get(`http://localhost:5000/api/chats/${bookingId}`)
      .then((res) => {
        const chat = res.data
        if (chat?.messages) {
          const formattedMessages = chat.messages.map((msg, index) => ({
            id: msg._id || index.toString(),
            content: msg.message,
            senderId: msg.senderId,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(formattedMessages)

          const other = chat.participants?.find((p) => p._id !== currentUser.id)
          if (other) {
            setOtherUser({
              id: other._id,
              name: other.username || 'User',
              avatar: other.avatar || '',
            })
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err)
        setConnectionError('Could not load chat history')
      })

    socket.on('receive_message', (message) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: message.message,
          senderId: message.senderId,
          timestamp: new Date(message.timestamp),
        },
      ])

      if (message.senderId !== currentUser.id && !otherUser) {
        setOtherUser({
          id: message.senderId,
          name: 'Other User',
          avatar: '',
        })
      }
    })

    return () => {
      socket.off('receive_message')
    }
  }, [socket, bookingId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !bookingId) return

    const messageData = {
      bookingId,
      senderId: currentUser.id,
      message: newMessage,
    }

    socket.emit('send_message', messageData)
    setNewMessage('')

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: newMessage,
        senderId: currentUser.id,
        timestamp: new Date(),
      },
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (connectionError) {
    return (
      <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Chat Error</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-center text-red-500">
          <div>
            {connectionError}
            <div className="mt-4 text-sm text-gray-500">
              Make sure <code>socket.io-client</code> is installed and server is running.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={otherUser?.avatar} />
            <AvatarFallback>{otherUser?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{otherUser?.name || 'Loading...'}</h2>
            <p className="text-xs text-gray-500">
              {socket?.connected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                msg.senderId === currentUser.id
                  ? 'bg-primary text-primary-foreground'
                  : msg.senderId === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-muted'
              }`}
            >
              {msg.senderId !== currentUser.id && msg.senderId !== 'system' && (
                <div className="font-semibold text-sm mb-1">
                  {msg.senderId === otherUser?.id ? otherUser.name : 'Unknown'}
                </div>
              )}
              <p>{msg.content}</p>
              <div
                className={`text-xs mt-1 text-right ${
                  msg.senderId === currentUser.id
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t p-4 bg-white">
        <div className="flex w-full items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!socket?.connected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !socket?.connected}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
