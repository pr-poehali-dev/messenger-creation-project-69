import { useState, useEffect } from 'react';
import Sidebar, { TabType } from '@/components/messenger/Sidebar';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow, { RealChat } from '@/components/messenger/ChatWindow';
import ChannelsPage from '@/components/messenger/ChannelsPage';
import CallsPage from '@/components/messenger/CallsPage';
import ProfilePage from '@/components/messenger/ProfilePage';
import SettingsPage from '@/components/messenger/SettingsPage';
import AuthScreen from '@/components/messenger/AuthScreen';
import FindUserModal from '@/components/messenger/FindUserModal';
import SearchBar from '@/components/messenger/SearchBar';
import Icon from '@/components/ui/icon';
import { chatsApi } from '@/lib/api';

interface AppUser {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_color: string;
  phone?: string;
}

export default function Index() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [selectedChat, setSelectedChat] = useState<RealChat | null>(null);
  const [search, setSearch] = useState('');
  const [showFind, setShowFind] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    const saved = localStorage.getItem('pulse_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch (_e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const poll = () => chatsApi.list().then(d => {
      const total = d.chats.reduce((s: number, c: { unread: number }) => s + c.unread, 0);
      setUnreadTotal(total);
    }).catch(() => {});
    poll();
    const t = setInterval(poll, 10000);
    return () => clearInterval(t);
  }, [user]);

  const handleAuth = (u: AppUser) => setUser(u);
  const handleLogout = () => { setUser(null); setSelectedChat(null); };

  const handleChatCreated = async (chatId: number) => {
    setShowFind(false);
    setActiveTab('chats');
    try {
      const data = await chatsApi.list();
      const chat = data.chats.find((c: RealChat) => c.id === chatId);
      if (chat) setSelectedChat(chat);
    } catch (_e) { /* ignore */ }
  };

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  const initials = user.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const panelTitles: Record<TabType, string> = {
    chats: 'Сообщения',
    calls: 'Звонки',
    channels: 'Каналы',
    profile: 'Профиль',
    settings: 'Настройки',
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {showFind && (
        <FindUserModal
          onClose={() => setShowFind(false)}
          onChatCreated={handleChatCreated}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => { setActiveTab(tab); if (tab !== 'chats') setSelectedChat(null); }}
        unreadChats={unreadTotal}
        userInitials={initials}
        userColor={user.avatar_color}
      />

      {/* Left panel */}
      <div className="w-72 flex flex-col border-r border-border bg-[hsl(224_18%_9%)] flex-shrink-0">
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-foreground">{panelTitles[activeTab]}</h1>
            {activeTab === 'chats' && (
              <button
                onClick={() => setShowFind(true)}
                className="w-8 h-8 rounded-xl gradient-pulse flex items-center justify-center text-white glow-sm hover:scale-105 transition-transform"
              >
                <Icon name="Plus" size={16} />
              </button>
            )}
          </div>
          {activeTab === 'chats' && (
            <SearchBar value={search} onChange={setSearch} placeholder="Поиск чатов..." />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && (
            <ChatList
              selectedChatId={selectedChat?.id ?? null}
              onSelectChat={chat => setSelectedChat(chat)}
              searchQuery={search}
              onNewChat={() => setShowFind(true)}
            />
          )}
          {activeTab === 'calls' && <CallsPage />}
          {activeTab === 'channels' && <ChannelsPage />}
          {activeTab === 'profile' && <ProfilePage user={user} onUpdate={u => setUser(u as AppUser)} />}
          {activeTab === 'settings' && <SettingsPage onLogout={handleLogout} />}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'chats' ? (
          <ChatWindow chat={selectedChat} myId={user.id} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-background gap-3">
            <div className="w-20 h-20 rounded-2xl gradient-pulse flex items-center justify-center glow-purple opacity-70">
              <span className="text-white font-bold text-4xl">P</span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-1">Pulse</h2>
              <p className="text-muted-foreground text-sm">Привет, {user.display_name}! 👋</p>
              <p className="text-muted-foreground text-xs mt-1">@{user.username}</p>
            </div>
            <button
              onClick={() => setActiveTab('chats')}
              className="mt-2 px-5 py-2.5 rounded-xl gradient-pulse text-white text-sm font-medium glow-sm hover:scale-105 transition-transform"
            >
              Перейти к чатам
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
