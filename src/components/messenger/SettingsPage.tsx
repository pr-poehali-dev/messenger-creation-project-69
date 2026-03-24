import { useState } from 'react';
import { authApi } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface SettingsPageProps {
  onLogout: () => void;
}

export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const [toggles, setToggles] = useState({
    notify_msg: true,
    notify_mention: true,
    read_receipt: true,
    online_status: true,
    two_fa: false,
    sounds: true,
  });

  const toggle = (id: keyof typeof toggles) =>
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_e) { /* ignore */ }
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    onLogout();
  };

  const groups = [
    {
      title: 'Уведомления', icon: 'Bell',
      items: [
        { id: 'notify_msg' as const, label: 'Новые сообщения', desc: 'Push при входящих сообщениях' },
        { id: 'notify_mention' as const, label: 'Упоминания', desc: 'Уведомлять при @упоминании' },
        { id: 'sounds' as const, label: 'Звуки', desc: 'Звуковые уведомления' },
      ],
    },
    {
      title: 'Конфиденциальность', icon: 'Shield',
      items: [
        { id: 'read_receipt' as const, label: 'Прочитано', desc: 'Показывать галочки прочтения' },
        { id: 'online_status' as const, label: 'Статус онлайн', desc: 'Показывать другим когда вы в сети' },
        { id: 'two_fa' as const, label: '2FA защита', desc: 'Двухфакторная аутентификация' },
      ],
    },
  ];

  const appItems = [
    { icon: 'Palette', label: 'Тема', desc: 'Тёмная' },
    { icon: 'Globe', label: 'Язык', desc: 'Русский' },
    { icon: 'HardDrive', label: 'Хранилище', desc: 'Очистить кэш' },
    { icon: 'HelpCircle', label: 'Поддержка', desc: '' },
    { icon: 'Info', label: 'О приложении', desc: 'Pulse v2.0' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h2 className="text-base font-bold gradient-text">Настройки</h2>
      </div>

      <div className="px-3 space-y-3">
        {groups.map(group => (
          <div key={group.title}>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <Icon name={group.icon} size={12} className="text-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</span>
            </div>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {group.items.map((item, i) => (
                <div key={item.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < group.items.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className="flex-1 pr-4">
                    <div className="text-sm text-foreground font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => toggle(item.id)}
                    className="relative flex-shrink-0 transition-all"
                    style={{ width: 40, height: 22 }}
                  >
                    <div className={`absolute inset-0 rounded-full transition-all ${toggles[item.id] ? 'gradient-pulse' : 'bg-secondary'}`} />
                    <div
                      className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all"
                      style={{ left: toggles[item.id] ? '20px' : '2px' }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* App settings */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <Icon name="Sliders" size={12} className="text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Приложение</span>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {appItems.map((a, i) => (
              <div key={a.icon}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors ${i < appItems.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={a.icon} size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{a.label}</div>
                  {a.desc && <div className="text-xs text-muted-foreground">{a.desc}</div>}
                </div>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/15 transition-colors text-sm font-medium"
        >
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
