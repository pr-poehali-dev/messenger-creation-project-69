import { useState, useEffect } from 'react';
import { channelsApi } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface Channel {
  id: number;
  name: string;
  username: string;
  description: string;
  avatar: string;
  subscriber_count: number;
  is_owner?: boolean;
  subscribed?: boolean;
}

interface Post {
  id: number;
  text: string;
  views: number;
  time: string;
  author: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selected, setSelected] = useState<Channel | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAvatar, setNewAvatar] = useState('📡');
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadChannels = async () => {
    try {
      const data = await channelsApi.list();
      setChannels(data.channels);
    } catch (_e) { /* ignore */ }
  };

  const loadPosts = async (ch: Channel) => {
    try {
      const data = await channelsApi.posts(ch.id);
      setPosts(data.posts);
    } catch (_e) { /* ignore */ }
  };

  useEffect(() => { loadChannels(); }, []);
  useEffect(() => { if (selected) loadPosts(selected); }, [selected]);

  const doSearch = async (q: string) => {
    setSearch(q);
    if (!q) { setSearchResults([]); return; }
    try {
      const data = await channelsApi.search(q);
      setSearchResults(data.channels);
    } catch (_e) { /* ignore */ }
  };

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await channelsApi.create({ name: newName, username: newUsername, description: newDesc, avatar: newAvatar });
      setChannels(prev => [data.channel, ...prev]);
      setShowCreate(false);
      setNewName(''); setNewUsername(''); setNewDesc(''); setNewAvatar('📡');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !postText.trim()) return;
    try {
      const data = await channelsApi.post(selected.id, postText.trim());
      setPosts(prev => [data.post, ...prev]);
      setPostText('');
    } catch (_e) { /* ignore */ }
  };

  const subscribe = async (ch: Channel) => {
    try {
      await channelsApi.subscribe(ch.id);
      setSearchResults(prev => prev.map(c => c.id === ch.id ? { ...c, subscribed: true, subscriber_count: c.subscriber_count + 1 } : c));
      await loadChannels();
    } catch (_e) { /* ignore */ }
  };

  const AVATARS = ['📡', '📢', '🎙️', '🎵', '📰', '🎮', '🏆', '💡', '🔥', '⚡'];

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-3 pb-2 flex items-center gap-3 flex-shrink-0 border-b border-border">
          <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <span className="text-xl">{selected.avatar}</span>
          <div className="flex-1">
            <div className="font-semibold text-sm text-foreground">{selected.name}</div>
            <div className="text-xs text-muted-foreground">@{selected.username} · {selected.subscriber_count} подписчиков</div>
          </div>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Icon name="FileText" size={28} className="mb-2 opacity-25" />
              <p className="text-sm">Постов пока нет</p>
            </div>
          )}
          {posts.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-3 animate-fade-in">
              <p className="text-sm text-foreground leading-relaxed">{p.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-muted-foreground">{p.time}</span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Icon name="Eye" size={11} />{p.views}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Post input for owner */}
        {selected.is_owner && (
          <form onSubmit={publishPost} className="px-3 py-2 border-t border-border flex gap-2 flex-shrink-0">
            <textarea
              value={postText}
              onChange={e => setPostText(e.target.value)}
              placeholder="Написать пост..."
              rows={2}
              className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none border border-border focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!postText.trim()}
              className="px-3 rounded-xl gradient-pulse text-white text-sm font-medium disabled:opacity-50"
            >
              <Icon name="Send" size={16} />
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 mb-3">
          <Icon name="Search" size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={e => doSearch(e.target.value)}
            placeholder="Поиск каналов..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {search && searchResults.length > 0 && (
        <div className="px-3 mb-3">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Найдено</div>
          <div className="space-y-1">
            {searchResults.map(ch => (
              <div key={ch.id} className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border">
                <span className="text-2xl">{ch.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{ch.name}</div>
                  <div className="text-xs text-muted-foreground">@{ch.username} · {ch.subscriber_count}</div>
                </div>
                <button
                  onClick={() => ch.subscribed ? setSelected(ch) : subscribe(ch)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                    ${ch.subscribed ? 'bg-secondary text-foreground' : 'gradient-pulse text-white'}`}
                >
                  {ch.subscribed ? 'Открыть' : 'Подписаться'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My channels */}
      <div className="px-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Мои каналы</span>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-6 h-6 rounded-lg gradient-pulse flex items-center justify-center text-white"
          >
            <Icon name="Plus" size={12} />
          </button>
        </div>

        {showCreate && (
          <form onSubmit={createChannel} className="bg-card border border-border rounded-2xl p-4 mb-3 animate-fade-in space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Новый канал</h3>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Название канала"
              required
              className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 outline-none"
            />
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-border focus-within:border-primary/50">
              <span className="text-muted-foreground text-sm">@</span>
              <input
                value={newUsername}
                onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                required
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Описание (необязательно)"
              rows={2}
              className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 outline-none resize-none"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Эмодзи</p>
              <div className="flex gap-1.5 flex-wrap">
                {AVATARS.map(a => (
                  <button key={a} type="button" onClick={() => setNewAvatar(a)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${newAvatar === a ? 'bg-primary/20 border border-primary/50' : 'bg-secondary hover:bg-secondary/80'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl bg-secondary text-muted-foreground text-sm">Отмена</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl gradient-pulse text-white text-sm font-medium">
                {loading ? 'Создаём...' : 'Создать'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1">
          {channels.length === 0 && !showCreate && (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
              <Icon name="Megaphone" size={24} className="mb-1 opacity-25" />
              <p className="text-xs">Нет каналов</p>
            </div>
          )}
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelected(ch)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-all text-left"
            >
              <span className="text-2xl w-10 h-10 flex items-center justify-center bg-secondary rounded-xl flex-shrink-0">{ch.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm text-foreground truncate">{ch.name}</span>
                  {ch.is_owner && <Icon name="Crown" size={11} className="text-yellow-400 flex-shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground">@{ch.username} · {ch.subscriber_count} подп.</div>
              </div>
              <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
