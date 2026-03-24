import { useState, useRef, useEffect } from 'react';
import { Chat, Message, MOCK_MESSAGES } from './data';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

interface ChatWindowProps {
  chat: Chat | null;
}

export default function ChatWindow({ chat }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chat) {
      setMessages(MOCK_MESSAGES[chat.id] || []);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [chat]);

  const send = () => {
    if (!input.trim() || !chat) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      chatId: chat.id,
      text: input.trim(),
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    endRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Simulate typing + reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        chatId: chat.id,
        text: 'Понял, отвечу чуть позже! 👍',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        sender: 'other',
        senderName: chat.name.split(' ')[0],
        read: false,
      };
      setMessages(prev => [...prev, reply]);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 2000 + Math.random() * 1500);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-24 h-24 rounded-full gradient-pulse flex items-center justify-center glow-purple opacity-80">
          <Icon name="MessageCircle" size={40} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Выберите чат</h2>
          <p className="text-muted-foreground text-sm">Начните общение, выбрав чат слева</p>
        </div>
      </div>
    );
  }

  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = 'Сегодня';
    const last = acc[acc.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else acc.push({ date, msgs: [msg] });
    return acc;
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border glass flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={chat.avatar} size="md" online={chat.type === 'personal' ? chat.online : undefined} />
          <div>
            <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              {chat.name}
              {chat.type === 'channel' && <Icon name="Megaphone" size={13} className="text-primary" />}
              {chat.type === 'group' && <Icon name="Users" size={13} className="text-primary" />}
            </div>
            <div className="text-xs text-muted-foreground">
              {chat.type === 'personal'
                ? chat.online ? <span className="text-green-400">онлайн</span> : 'был(а) недавно'
                : chat.type === 'group' ? '8 участников'
                : '1 243 подписчика'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Search" size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Phone" size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Video" size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="MoreVertical" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex justify-center my-3">
              <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs">{group.date}</span>
            </div>
            {group.msgs.map((msg, i) => {
              const isMe = msg.sender === 'me';
              const showName = !isMe && chat.type !== 'personal' &&
                (i === 0 || group.msgs[i - 1]?.sender !== msg.sender);
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1 animate-fade-in`}>
                  {!isMe && chat.type !== 'personal' && (
                    <div className="w-6 flex-shrink-0 mr-1 mt-auto">
                      {(i === group.msgs.length - 1 || group.msgs[i + 1]?.sender !== msg.sender) && (
                        <Avatar name={chat.avatar} size="sm" />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showName && (
                      <span className="text-xs font-medium text-primary mb-1 ml-3">{msg.senderName}</span>
                    )}
                    <div
                      className={`px-3 py-2 text-sm leading-relaxed
                        ${isMe
                          ? 'gradient-pulse text-white message-out'
                          : 'bg-card text-foreground message-in border border-border/50'
                        }`}
                    >
                      {msg.text}
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-end'}`}>
                        <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {msg.time}
                        </span>
                        {isMe && (
                          <Icon
                            name={msg.read ? 'CheckCheck' : 'Check'}
                            size={12}
                            className={msg.read ? 'text-cyan-300' : 'text-white/70'}
                          />
                        )}
                      </div>
                    </div>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {msg.reactions.map(r => (
                          <span key={r.emoji} className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary text-xs border border-border/50 cursor-pointer hover:border-primary/50 transition-colors">
                            {r.emoji} <span className="text-muted-foreground">{r.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 animate-fade-in">
            <Avatar name={chat.avatar} size="sm" />
            <div className="flex items-center gap-1 px-3 py-2 bg-card rounded-2xl rounded-bl-sm border border-border/50">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <div className="flex items-end gap-2 bg-card rounded-2xl border border-border px-3 py-2 focus-within:border-primary/50 transition-colors">
          <button className="text-muted-foreground hover:text-primary transition-colors mb-0.5">
            <Icon name="Paperclip" size={18} />
          </button>
          <textarea
            ref={inputRef}
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
            disabled={!input.trim()}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0
              ${input.trim()
                ? 'gradient-pulse text-white glow-sm hover:scale-105'
                : 'bg-secondary text-muted-foreground'
              }`}
          >
            <Icon name="Send" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
