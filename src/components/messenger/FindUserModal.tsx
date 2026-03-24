import { useState } from 'react';
import { authApi, chatsApi } from '@/lib/api';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_color: string;
  online: boolean;
}

interface FindUserModalProps {
  onClose: () => void;
  onChatCreated: (chatId: number) => void;
}

export default function FindUserModal({ onClose, onChatCreated }: FindUserModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);

  const search = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await authApi.search(q);
      setResults(data.users);
    } catch (_e) { /* ignore */ }
    setLoading(false);
  };

  const startChat = async (userId: number) => {
    setCreating(userId);
    try {
      const data = await chatsApi.create(userId);
      onChatCreated(data.chat_id);
    } catch (_e) { /* ignore */ }
    setCreating(null);
  };

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => search(e.target.value)}
            placeholder="Найти по @username или имени..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-6">
              <Icon name="Loader2" size={20} className="text-primary animate-spin" />
            </div>
          )}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-8 text-muted-foreground text-sm">Никого не найдено</div>
          )}
          {!loading && !query && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Icon name="Search" size={24} className="mx-auto mb-2 opacity-25" />
              Введите @username или имя
            </div>
          )}
          {results.map(user => (
            <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-all border-b border-border/30 last:border-0">
              <Avatar name={initials(user.display_name)} size="md" online={user.online} color={user.avatar_color} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{user.display_name}</div>
                <div className="text-xs text-muted-foreground">@{user.username}</div>
                {user.bio && <div className="text-xs text-muted-foreground truncate">{user.bio}</div>}
              </div>
              <button
                onClick={() => startChat(user.id)}
                disabled={creating === user.id}
                className="px-3 py-1.5 rounded-xl gradient-pulse text-white text-xs font-medium glow-sm hover:scale-105 transition-transform disabled:opacity-60 flex-shrink-0"
              >
                {creating === user.id
                  ? <Icon name="Loader2" size={13} className="animate-spin" />
                  : 'Написать'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
