import { useState, useEffect } from 'react';
import { chatsApi } from '@/lib/api';
import { RealChat } from './ChatWindow';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

interface ChatListProps {
  selectedChatId: number | null;
  onSelectChat: (chat: RealChat) => void;
  searchQuery: string;
  onNewChat: () => void;
}

export default function ChatList({ selectedChatId, onSelectChat, searchQuery, onNewChat }: ChatListProps) {
  const [chats, setChats] = useState<RealChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'personal' | 'group'>('all');

  const load = async () => {
    try {
      const data = await chatsApi.list();
      setChats(data.chats);
    } catch (_e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = chats.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.last_message.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || c.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pb-2 flex gap-1.5">
        {(['all', 'personal', 'group'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all
              ${filter === f ? 'gradient-pulse text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            {{ all: 'Все', personal: 'Личные', group: 'Группы' }[f]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
        {loading && (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" size={20} className="text-primary animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-3">
            <Icon name="MessageCircle" size={32} className="opacity-25" />
            <p className="text-sm text-center px-4">
              {searchQuery ? 'Ничего не найдено' : 'Нет чатов. Найдите друга по username!'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewChat}
                className="px-4 py-2 rounded-xl gradient-pulse text-white text-xs font-medium glow-sm"
              >
                Найти пользователя
              </button>
            )}
          </div>
        )}

        {filtered.map(chat => {
          const isSelected = selectedChatId === chat.id;
          const timeStr = chat.last_time ? (() => {
            try { return new Date(chat.last_time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }); }
            catch { return ''; }
          })() : '';
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                ${isSelected ? 'bg-primary/15 border border-primary/25' : 'hover:bg-secondary/50'}`}
            >
              <Avatar name={chat.avatar} size="md" online={chat.type === 'personal' ? chat.online : undefined} color={chat.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-sm truncate text-foreground/90">{chat.name}</span>
                  <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{timeStr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">{chat.last_message || 'Нет сообщений'}</span>
                  {chat.unread > 0 && (
                    <span className="ml-2 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center px-1.5 flex-shrink-0">
                      {chat.unread > 99 ? '99+' : chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
