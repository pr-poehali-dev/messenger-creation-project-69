import { useState } from 'react';
import Icon from '@/components/ui/icon';

type SettingToggle = {
  id: string;
  label: string;
  desc: string;
  value: boolean;
};

export default function SettingsPage() {
  const [toggles, setToggles] = useState<SettingToggle[]>([
    { id: 'notify_msg', label: 'Уведомления о сообщениях', desc: 'Push-уведомления при новых сообщениях', value: true },
    { id: 'notify_mention', label: 'Упоминания', desc: 'Уведомлять, когда вас упоминают', value: true },
    { id: 'read_receipt', label: 'Уведомления о прочтении', desc: 'Показывать, что сообщение прочитано', value: true },
    { id: 'online_status', label: 'Статус онлайн', desc: 'Показывать другим, что вы в сети', value: true },
    { id: 'two_fa', label: 'Двухфакторная аутентификация', desc: 'Дополнительная защита аккаунта', value: false },
    { id: 'sounds', label: 'Звуки', desc: 'Звуковые уведомления', value: true },
  ]);

  const toggle = (id: string) =>
    setToggles(prev => prev.map(t => t.id === id ? { ...t, value: !t.value } : t));

  const groups: { title: string; icon: string; items: typeof sections[0]['items'] }[] = [
    {
      title: 'Конфиденциальность',
      icon: 'Shield',
      items: toggles.slice(3, 5).map(t => ({ ...t, type: 'toggle' as const })),
    },
    {
      title: 'Уведомления',
      icon: 'Bell',
      items: toggles.slice(0, 3).map(t => ({ ...t, type: 'toggle' as const })),
    },
    {
      title: 'Медиа и звук',
      icon: 'Volume2',
      items: toggles.slice(5).map(t => ({ ...t, type: 'toggle' as const })),
    },
  ];

  const actions = [
    { icon: 'Palette', label: 'Тема оформления', desc: 'Тёмная', action: () => {} },
    { icon: 'Globe', label: 'Язык', desc: 'Русский', action: () => {} },
    { icon: 'HardDrive', label: 'Хранилище', desc: '2.4 ГБ использовано', action: () => {} },
    { icon: 'HelpCircle', label: 'Помощь и поддержка', desc: '', action: () => {} },
    { icon: 'Info', label: 'О приложении', desc: 'Pulse v1.0', action: () => {} },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold gradient-text">Настройки</h2>
      </div>

      <div className="px-3 space-y-4">
        {groups.map(group => (
          <div key={group.title}>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <Icon name={group.icon} size={13} className="text-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</span>
            </div>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {group.items.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < group.items.length - 1 ? 'border-b border-border/50' : ''}`}
                >
                  <div className="flex-1 pr-4">
                    <div className="text-sm text-foreground font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => toggle(item.id)}
                    className={`w-10 h-5.5 rounded-full relative transition-all flex-shrink-0 ${item.value ? 'gradient-pulse' : 'bg-secondary'}`}
                    style={{ height: '22px', width: '40px' }}
                  >
                    <span
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all ${item.value ? 'left-[18px]' : 'left-0.5'}`}
                      style={{ width: '18px', height: '18px', top: '2px' }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <Icon name="Sliders" size={13} className="text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Приложение</span>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {actions.map((a, i) => (
              <button
                key={a.icon}
                onClick={a.action}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors ${i < actions.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={a.icon} size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{a.label}</div>
                  {a.desc && <div className="text-xs text-muted-foreground">{a.desc}</div>}
                </div>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/15 transition-colors text-sm font-medium">
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

// Fix for unused variable
const sections: { title: string; items: { id: string; label: string; desc: string; type: 'toggle' | 'link'; value?: boolean }[] }[] = [];
