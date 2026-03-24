import { useState } from 'react';
import { MOCK_NOTIFICATIONS, Notification } from './data';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

const typeIcons: Record<Notification['type'], { icon: string; color: string }> = {
  message: { icon: 'MessageCircle', color: 'text-primary' },
  mention: { icon: 'AtSign', color: 'text-cyan-400' },
  reaction: { icon: 'Heart', color: 'text-rose-400' },
  system: { icon: 'Zap', color: 'text-yellow-400' },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const unread = notifs.filter(n => !n.read);
  const read = notifs.filter(n => n.read);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold gradient-text">Уведомления</h2>
            {unread.length > 0 && (
              <p className="text-xs text-muted-foreground">{unread.length} непрочитанных</p>
            )}
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Прочитать все
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {unread.length > 0 && (
          <>
            <div className="px-1 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Новые
            </div>
            {unread.map(n => <NotifItem key={n.id} notif={n} onRead={markRead} />)}
            {read.length > 0 && <div className="my-2 border-t border-border/50" />}
          </>
        )}

        {read.length > 0 && (
          <>
            {unread.length > 0 && (
              <div className="px-1 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Прочитанные
              </div>
            )}
            {read.map(n => <NotifItem key={n.id} notif={n} onRead={markRead} />)}
          </>
        )}

        {notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Icon name="BellOff" size={40} className="mb-3 opacity-25" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const { icon, color } = typeIcons[notif.type];
  return (
    <button
      onClick={() => onRead(notif.id)}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all hover:bg-secondary/50 group
        ${!notif.read ? 'bg-primary/8' : ''}`}
    >
      <div className="relative flex-shrink-0">
        <Avatar name={notif.avatar} size="md" />
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center`}>
          <Icon name={icon} size={9} className={color} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-medium ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
            {notif.title}
          </span>
          <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{notif.time}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed truncate">{notif.text}</p>
      </div>
      {!notif.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </button>
  );
}
