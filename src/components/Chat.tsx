import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, UserPlus } from 'lucide-react';
import { Message } from '../types';
import SimplePeer from 'simple-peer';
import VideoChat from './VideoChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  isConnected: boolean;
  isTyping: boolean;
  socket: any;
  partnerId: string | null;
  isInitiator: boolean;
}

export default function Chat({ 
  messages, 
  onSendMessage, 
  onNewChat, 
  isConnected, 
  isTyping, 
  socket,
  partnerId,
  isInitiator
}: ChatProps) {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isConnected && partnerId) {
      initializePeer();
    }
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      peerRef.current?.destroy();
    };
  }, [isConnected, partnerId]);

  const initializePeer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoEnabled, 
        audio: audioEnabled 
      });
      
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new SimplePeer({
        initiator: isInitiator,
        stream,
        trickle: false
      });

      peer.on('signal', (data) => {
        socket.emit('signal', { signal: data, to: partnerId });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      socket.on('signal', ({ signal }) => {
        peer.signal(signal);
      });

      peerRef.current = peer;
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const toggleVideo = async () => {
    setVideoEnabled(!videoEnabled);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-lg">
      <div className="bg-white shadow-sm border-b rounded-t-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Random Chat</h2>
            </div>
            <button
              onClick={onNewChat}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      <VideoChat
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      <MessageList
        messages={messages}
        isTyping={isTyping}
        isConnected={isConnected}
      />

      <MessageInput
        onSendMessage={onSendMessage}
        isConnected={isConnected}
      />
    </div>
  );
}