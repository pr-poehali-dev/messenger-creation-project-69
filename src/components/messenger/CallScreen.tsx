import { useState, useEffect } from 'react';
import { RealChat } from './ChatWindow';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

interface CallScreenProps {
  chat: RealChat;
  callType: 'audio' | 'video';
  onEnd: (status: string, duration: number) => void;
}

export default function CallScreen({ chat, callType, onEnd }: CallScreenProps) {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<'calling' | 'connected'>('calling');
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  useEffect(() => {
    // Simulate pickup after 2s
    const t = setTimeout(() => setStatus('connected'), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== 'connected') return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    onEnd(status === 'connected' ? 'answered' : 'missed', seconds);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-52 h-52 rounded-full bg-pink-600/8 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm px-6">
        {/* Avatar */}
        <div className={`relative ${status === 'calling' ? 'pulse-ring' : ''}`}>
          <Avatar name={chat.avatar} size="xl" online={chat.online} color={chat.color} />
        </div>

        {/* Name + status */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">{chat.name}</h2>
          <p className="text-muted-foreground text-sm">
            {status === 'calling'
              ? callType === 'video' ? 'Видеозвонок...' : 'Голосовой звонок...'
              : formatTime(seconds)
            }
          </p>
          {callType === 'video' && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
              <Icon name="Video" size={12} /> Видео
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setMuted(!muted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
              ${muted ? 'bg-rose-500/20 text-rose-400' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <Icon name={muted ? 'MicOff' : 'Mic'} size={22} />
          </button>

          <button
            onClick={handleEnd}
            className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center glow-sm hover:scale-105 transition-all"
            style={{ boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}
          >
            <Icon name="PhoneOff" size={24} />
          </button>

          <button
            onClick={() => setSpeaker(!speaker)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
              ${speaker ? 'gradient-pulse text-white glow-sm' : 'bg-secondary text-muted-foreground'}`}
          >
            <Icon name={speaker ? 'Volume2' : 'VolumeX'} size={22} />
          </button>
        </div>

        {callType === 'video' && status === 'connected' && (
          <div className="w-full h-32 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground gap-2">
            <Icon name="VideoOff" size={20} />
            <span className="text-sm">Видео недоступно в демо-режиме</span>
          </div>
        )}
      </div>
    </div>
  );
}
