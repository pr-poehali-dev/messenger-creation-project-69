import { useState, useRef, useEffect, useCallback } from 'react';
import { chatsApi, callsApi } from '@/lib/api';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';
import CallScreen from './CallScreen';

export interface RealChat {
  id: number;
  type: 'personal' | 'group';
  name: string;
  avatar: string;
  color: string;
  online: boolean;
  partner_id?: number;
  username?: string;
  last_message: string;
  last_time: string;
  unread: number;
}

interface ApiMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_color: string;
  text: string;
  is_mine: boolean;
  read: boolean;
  time: string;
}

interface ChatWindowProps {
  chat: RealChat | null;
  myId: number;
}

export default function ChatWindow({ chat, myId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callId, setCallId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!chat) return;
    try {
      const data = await chatsApi.messages(chat.id);
      setMessages(data.messages);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (_e) { /* ignore */ }
  }, [chat]);

  useEffect(() => {
    if (!chat) return;
    setMessages([]);
    setLoading(true);
    loadMessages().finally(() => setLoading(false));

    // Poll every 3s
    pollRef.current = setInterval(loadMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [chat, loadMessages]);

  const send = async () => {
    if (!input.trim() || !chat || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const data = await chatsApi.send(chat.id, text);
      setMessages(prev => [...prev, data.message]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (_e) {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const startCall = async (type: 'audio' | 'video') => {
    if (!chat?.partner_id) return;
    try {
      const data = await callsApi.initiate(chat.partner_id, type);
      setCallId(data.call_id);
      setCallType(type);
      setCallActive(true);
    } catch (_e) { /* ignore */ }
  };

  const endCall = async (status: string, duration: number) => {
    if (callId) await callsApi.end(callId, status, duration);
    setCallActive(false);
    setCallId(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-24 h-24 rounded-full gradient-pulse flex items-center justify-center glow-purple opacity-80">
          <Icon name="MessageCircle" size={40} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Выберите чат</h2>
          <p className="text-muted-foreground text-sm">Начните общение, выбрав контакт слева</p>
        </div>
      </div>
    );
  }

  if (callActive) {
    return <CallScreen chat={chat} callType={callType} onEnd={endCall} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border glass flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={chat.avatar} size="md" online={chat.type === 'personal' ? chat.online : undefined} color={chat.color} />
          <div>
            <div className="font-semibold text-sm text-foreground">{chat.name}</div>
            <div className="text-xs text-muted-foreground">
              {chat.type === 'personal'
                ? chat.online ? <span className="text-green-400">онлайн</span> : 'был(а) недавно'
                : ''}
              {chat.username && <span className="ml-1 text-muted-foreground">@{chat.username}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {chat.type === 'personal' && (
            <>
              <button onClick={() => startCall('audio')} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-green-400 transition-colors">
                <Icon name="Phone" size={16} />
              </button>
              <button onClick={() => startCall('video')} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Video" size={16} />
              </button>
            </>
          )}
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="MoreVertical" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading && (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" size={24} className="text-primary animate-spin" />
          </div>
        )}
        {messages.map((msg, i) => {
          const showName = !msg.is_mine && chat.type !== 'personal' &&
            (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id);
          return (
            <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'} mb-1 animate-fade-in`}>
              <div className={`max-w-[65%] flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                {showName && (
                  <span className="text-xs font-medium text-primary mb-1 ml-3">{msg.sender_name}</span>
                )}
                <div className={`px-3 py-2 text-sm leading-relaxed
                  ${msg.is_mine
                    ? 'gradient-pulse text-white message-out'
                    : 'bg-card text-foreground message-in border border-border/50'
                  }`}
                >
                  {msg.text}
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className={`text-[10px] ${msg.is_mine ? 'text-white/70' : 'text-muted-foreground'}`}>{msg.time}</span>
                    {msg.is_mine && (
                      <Icon name={msg.read ? 'CheckCheck' : 'Check'} size={12} className={msg.read ? 'text-cyan-300' : 'text-white/70'} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <div className="flex items-end gap-2 bg-card rounded-2xl border border-border px-3 py-2 focus-within:border-primary/50 transition-colors">
          <button className="text-muted-foreground hover:text-primary transition-colors mb-0.5">
            <Icon name="Paperclip" size={18} />
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Написать сообщение..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none max-h-32 leading-relaxed py-0.5"
            style={{ minHeight: '24px' }}
          />
          <button className="text-muted-foreground hover:text-primary transition-colors mb-0.5">
            <Icon name="Smile" size={18} />
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              ${input.trim() && !sending
                ? 'gradient-pulse text-white glow-sm hover:scale-105'
                : 'bg-secondary text-muted-foreground'
              }`}
          >
            {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}