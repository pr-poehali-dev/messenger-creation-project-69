import Icon from '@/components/ui/icon';

export type TabType = 'chats' | 'contacts' | 'notifications' | 'profile' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  notificationCount: number;
  unreadChats: number;
}

const tabs: { id: TabType; icon: string; label: string }[] = [
  { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
];

export default function Sidebar({ activeTab, onTabChange, notificationCount, unreadChats }: SidebarProps) {
  const getBadge = (tab: TabType) => {
    if (tab === 'chats' && unreadChats > 0) return unreadChats;
    if (tab === 'notifications' && notificationCount > 0) return notificationCount;
    return null;
  };

  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-1 bg-[hsl(224_22%_6%)] border-r border-border">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl gradient-pulse flex items-center justify-center mb-4 glow-sm">
        <span className="text-white font-bold text-lg">P</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {tabs.map(tab => {
          const badge = getBadge(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group
                ${isActive
                  ? 'gradient-pulse text-white glow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              <Icon name={tab.icon} size={20} />
              {badge && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-secondary text-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Online dot */}
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
      </div>
    </aside>
  );
}
