import { useState } from 'react';
import Sidebar, { TabType } from '@/components/messenger/Sidebar';
import ChatList from '@/components/messenger/ChatList';
import ChatWindow from '@/components/messenger/ChatWindow';
import ContactsPage from '@/components/messenger/ContactsPage';
import NotificationsPage from '@/components/messenger/NotificationsPage';
import ProfilePage from '@/components/messenger/ProfilePage';
import SettingsPage from '@/components/messenger/SettingsPage';
import AuthScreen from '@/components/messenger/AuthScreen';
import SearchBar from '@/components/messenger/SearchBar';
import { MOCK_CHATS, MOCK_NOTIFICATIONS, Chat } from '@/components/messenger/data';
import Icon from '@/components/ui/icon';

export default function Index() {
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [search, setSearch] = useState('');

  const unreadChats = MOCK_CHATS.reduce((acc, c) => acc + (c.unread > 0 ? 1 : 0), 0);
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  if (!authed) {
    return <AuthScreen onAuth={name => { setUserName(name); setAuthed(true); }} />;
  }

  const panelTitles: Record<TabType, string> = {
    chats: 'Сообщения',
    contacts: 'Контакты',
    notifications: 'Уведомления',
    profile: 'Профиль',
    settings: 'Настройки',
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar nav */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          if (tab !== 'chats') setSelectedChat(null);
        }}
        notificationCount={unreadNotifs}
        unreadChats={unreadChats}
      />

      {/* Left panel */}
      <div className="w-72 flex flex-col border-r border-border bg-[hsl(224_18%_9%)] flex-shrink-0">
        {/* Panel header */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-foreground">{panelTitles[activeTab]}</h1>
            {activeTab === 'chats' && (
              <button className="w-8 h-8 rounded-xl gradient-pulse flex items-center justify-center text-white glow-sm hover:scale-105 transition-transform">
                <Icon name="Plus" size={16} />
              </button>
            )}
          </div>
          {activeTab === 'chats' && (
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Поиск чатов..."
            />
          )}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && (
            <ChatList
              selectedChatId={selectedChat?.id ?? null}
              onSelectChat={chat => setSelectedChat(chat)}
              searchQuery={search}
            />
          )}
          {activeTab === 'contacts' && <ContactsPage />}
          {activeTab === 'notifications' && <NotificationsPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'chats' ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-background gap-3">
            <div className="w-20 h-20 rounded-2xl gradient-pulse flex items-center justify-center glow-purple opacity-70">
              <span className="text-white font-bold text-4xl">P</span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-1">Pulse</h2>
              <p className="text-muted-foreground text-sm">Привет, {userName}! 👋</p>
              <p className="text-muted-foreground text-xs mt-1">Быстрый и безопасный мессенджер</p>
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
