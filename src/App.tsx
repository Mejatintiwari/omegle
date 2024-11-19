import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Chat from './components/Chat';
import OnlineStats from './components/OnlineStats';
import { Message, Stats } from './types';
import { MessageCircle } from 'lucide-react';

const socket = io('http://localhost:3000');

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState<Stats>({ onlineUsers: 0, activeChats: 0 });
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);
  
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('findPartner');
    });

    socket.on('partnerFound', ({ initiator, partnerId: newPartnerId }) => {
      setIsConnected(true);
      setMessages([]);
      setIsInitiator(initiator);
      setPartnerId(newPartnerId);
    });

    socket.on('partnerDisconnected', () => {
      setIsConnected(false);
      setPartnerId(null);
      setMessages(prev => [...prev, { text: 'Your partner has disconnected.', isSelf: false }]);
    });

    socket.on('message', (message: string) => {
      setMessages(prev => [...prev, { text: message, isSelf: false }]);
    });

    socket.on('typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    });

    socket.on('stats', (newStats: Stats) => {
      setStats(newStats);
    });

    return () => {
      socket.off('connect');
      socket.off('partnerFound');
      socket.off('partnerDisconnected');
      socket.off('message');
      socket.off('typing');
      socket.off('stats');
    };
  }, []);

  const handleSendMessage = (message: string) => {
    socket.emit('message', message);
    setMessages(prev => [...prev, { text: message, isSelf: true }]);
  };

  const handleNewChat = () => {
    setIsConnected(false);
    setPartnerId(null);
    setMessages([]);
    socket.emit('findPartner');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Uhmegle
              </h1>
            </div>
            <p className="text-sm text-gray-500 hidden sm:block">Talk to strangers!</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              onNewChat={handleNewChat}
              isConnected={isConnected}
              isTyping={isTyping}
              socket={socket}
              partnerId={partnerId}
              isInitiator={isInitiator}
            />
          </div>
          <div className="order-first lg:order-last mb-4 lg:mb-0">
            <OnlineStats stats={stats} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Uhmegle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;