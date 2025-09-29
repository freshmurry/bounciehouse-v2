import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/api/entities';
import { User } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserAvatar from '../ui/UserAvatar';

export default function MessageModal({ isOpen, onClose, recipientId, listingTitle }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [user, recipientData] = await Promise.all([
        User.me(),
        User.list().then(users => users.find(u => u.id === recipientId))
      ]);
      
      setCurrentUser(user);
      setRecipient(recipientData);
      
      // Load existing messages between these users
      const allMessages = await Message.list();
      const conversationMessages = allMessages.filter(msg => 
        (msg.sender_id === user.id && msg.recipient_id === recipientId) ||
        (msg.sender_id === recipientId && msg.recipient_id === user.id)
      ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading message data:', error);
    }
  }, [recipientId]);

  useEffect(() => {
    if (isOpen && recipientId) {
      loadData();
    }
  }, [isOpen, loadData, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // loadData defined above with useCallback

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const messageData = {
        sender_id: currentUser.id,
        recipient_id: recipientId,
        content: newMessage.trim()
      };

      await Message.create(messageData);
      setNewMessage('');
      loadData(); // Reload messages

      // Check if recipient needs notification (mock check - in real app, track last login)
      const shouldNotify = Math.random() > 0.5; // Mock: 50% chance they need notification
      
      if (shouldNotify && recipient?.email) {
        try {
          await SendEmail({
            to: recipient.email,
            subject: 'You have a new message on BouncieHouse',
            body: `Hi ${recipient.first_name || 'there'},\n\nYou have a new message from ${currentUser.first_name || 'a user'} about "${listingTitle}".\n\nLog in to BouncieHouse to read and respond: ${window.location.origin}\n\nThanks,\nThe BouncieHouse Team`
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <UserAvatar user={recipient} size="sm" />
            <div>
              <h3 className="font-medium">{recipient?.first_name || 'Host'}</h3>
              <p className="text-sm text-gray-500">About: {listingTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">Start the conversation!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm ${
                    message.sender_id === currentUser?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}