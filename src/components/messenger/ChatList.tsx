import { useState } from 'react';
import { MOCK_CHATS, Chat } from './data';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  searchQuery: string;
}

export default function ChatList({ selectedChatId, onSelectChat, searchQuery }: ChatListProps) {
  const [filter, setFilter] = useState<'all' | 'personal' | 'groups' | 'channels'>('all');

  const filtered = MOCK_CHATS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || 
      (filter === 'personal' && c.type === 'personal') ||
      (filter === 'groups' && c.type === 'group') ||
      (filter === 'channels' && c.type === 'channel');
    return matchSearch && matchFilter;
  });

  const pinned = filtered.filter(c => c.pinned);
  const rest = filtered.filter(c => !c.pinned);

  const renderChat = (chat: Chat) => {
    const isSelected = selectedChatId === chat.id;
    return (
      <button
        key={chat.id}
        onClick={() => onSelectChat(chat)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group
          ${isSelected
            ? 'bg-primary/15 border border-primary/25'
            : 'hover:bg-secondary/50'
          }`}
      >
        <Avatar name={chat.avatar} size="md" online={chat.type === 'personal' ? chat.online : undefined} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className={`font-medium text-sm truncate ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
              {chat.name}
              {chat.type === 'channel' && (
                <Icon name="Megaphone" size={12} className="inline ml-1 text-muted-foreground" />
              )}
              {chat.pinned && (
                <Icon name="Pin" size={11} className="inline ml-1 text-muted-foreground" />
              )}
            </span>
            <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{chat.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">{chat.lastMessage}</span>
            {chat.unread > 0 && (
              <span className="ml-2 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center px-1.5 flex-shrink-0">
                {chat.unread > 99 ? '99+' : chat.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter pills */}
      <div className="px-3 pb-2 flex gap-1.5">
        {(['all', 'personal', 'groups', 'channels'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all
              ${filter === f
                ? 'gradient-pulse text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
          >
            {{ all: 'Все', personal: 'Личные', groups: 'Группы', channels: 'Каналы' }[f]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
        {pinned.length > 0 && (
          <>
            <div className="px-1 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Закреплённые
            </div>
            {pinned.map(renderChat)}
            <div className="my-1 border-t border-border/50" />
          </>
        )}
        {rest.length > 0 && rest.map(renderChat)}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Icon name="Search" size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
