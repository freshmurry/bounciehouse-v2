import React, { useState } from 'react';
import { Search, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UserAvatar from '../components/ui/UserAvatar';

const conversations = [
  { 
    id: 1, 
    user: { 
      id: 'user1', 
      full_name: 'John Doe', 
      profile_image: 'https://randomuser.me/api/portraits/men/32.jpg' 
    }, 
    lastMessage: 'Sounds good, see you then!', 
    timestamp: '10:42 AM', 
    unread: 2 
  },
  { 
    id: 2, 
    user: { 
      id: 'user2', 
      full_name: 'Jane Smith', 
      profile_image: 'https://randomuser.me/api/portraits/women/44.jpg' 
    }, 
    lastMessage: 'Is the 15th available?', 
    timestamp: 'Yesterday', 
    unread: 0 
  },
  { 
    id: 3, 
    user: { 
      id: 'support', 
      full_name: 'BouncieHouse Support', 
      profile_image: null 
    }, 
    lastMessage: 'Your payout has been processed.', 
    timestamp: '3 days ago', 
    unread: 0 
  },
];

const messages = {
  1: [
    { sender: 'other', text: 'Hey! Is the Mega Castle available for next Saturday?', user: conversations[0].user },
    { sender: 'me', text: 'Hi John, yes it is! What time were you thinking?' },
    { sender: 'other', text: 'Great! We\'d need it from 1 PM to 5 PM.', user: conversations[0].user },
    { sender: 'me', text: 'Sounds good, see you then!' },
  ],
  2: [
    { sender: 'other', text: 'Is the 15th available?', user: conversations[1].user },
  ]
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    console.log(`Sending to ${selectedConversation.id}: ${newMessage}`);
    
    if (!messages[selectedConversation.id]) {
      messages[selectedConversation.id] = [];
    }
    messages[selectedConversation.id].push({ sender: 'me', text: newMessage });
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(convo =>
    convo.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-6 border-b border-gray-200">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search conversations" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-airbnb-red focus:border-transparent outline-none" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => setSelectedConversation(convo)}
              className={`w-full text-left p-4 flex items-center space-x-3 border-l-4 transition-colors ${
                selectedConversation.id === convo.id 
                  ? 'border-airbnb-red bg-red-50' 
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <UserAvatar user={convo.user} size="md" />
                {convo.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-airbnb-red text-white text-xs rounded-full flex items-center justify-center">
                    {convo.unread}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 truncate">{convo.user.full_name}</h3>
                  <p className="text-xs text-gray-500">{convo.timestamp}</p>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{convo.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3 bg-white">
              <UserAvatar user={selectedConversation.user} size="md" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedConversation.user.full_name}</h2>
                <p className="text-sm text-gray-500">Usually responds within an hour</p>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {(messages[selectedConversation.id] || []).map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-md ${msg.sender === 'me' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {msg.sender !== 'me' && (
                      <UserAvatar user={msg.user || selectedConversation.user} size="sm" />
                    )}
                    <div className={`p-3 rounded-2xl ${
                      msg.sender === 'me' 
                        ? 'bg-airbnb-red text-white' 
                        : 'bg-white shadow border border-gray-200'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedConversation.user.full_name}...`}
                  className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-airbnb-red focus:border-transparent outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-3 bg-airbnb-red text-white rounded-full hover:bg-airbnb-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}