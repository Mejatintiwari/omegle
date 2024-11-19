import React, { useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface VideoChatProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

export default function VideoChat({
  videoEnabled,
  audioEnabled,
  toggleVideo,
  toggleAudio,
  localVideoRef,
  remoteVideoRef
}: VideoChatProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 flex-1">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          You
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-full transition-all duration-200 ${
              videoEnabled ? 'bg-blue-500' : 'bg-red-500'
            } text-white`}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full transition-all duration-200 ${
              audioEnabled ? 'bg-blue-500' : 'bg-red-500'
            } text-white`}
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          Stranger
        </div>
      </div>
    </div>
  );
}