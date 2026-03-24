import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Александр Иванов');
  const [bio, setBio] = useState('Разработчик, люблю чистый код ☕');
  const [username, setUsername] = useState('@alex_ivanov');

  const stats = [
    { label: 'Чатов', value: '24' },
    { label: 'Контактов', value: '128' },
    { label: 'Групп', value: '7' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Cover */}
      <div className="relative flex-shrink-0">
        <div className="h-28 gradient-pulse relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/20 border-2 border-[#8B5CF6]/60 flex items-center justify-center text-2xl font-bold text-[#8B5CF6] shadow-lg">
                АИ
              </div>
              <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full gradient-pulse flex items-center justify-center">
                <Icon name="Camera" size={10} className="text-white" />
              </button>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                ${editing ? 'gradient-pulse text-white glow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {editing ? 'Сохранить' : 'Изменить'}
            </button>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50"
                placeholder="Имя"
              />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50"
                placeholder="Имя пользователя"
              />
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50 resize-none"
                placeholder="О себе"
              />
            </div>
          ) : (
            <div className="mt-3">
              <h2 className="font-bold text-foreground text-base">{name}</h2>
              <p className="text-xs text-primary">{username}</p>
              <p className="text-xs text-muted-foreground mt-1">{bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2">
          {stats.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 flex-shrink-0">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {[
            { icon: 'Phone', label: 'Телефон', value: '+7 999 123-45-67' },
            { icon: 'Mail', label: 'Email', value: 'alex@example.com' },
            { icon: 'MapPin', label: 'Город', value: 'Москва, Россия' },
            { icon: 'Calendar', label: 'В Pulse с', value: 'Март 2026' },
          ].map((item, i, arr) => (
            <div key={item.icon} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-border/50' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={item.icon} size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-muted-foreground">{item.label}</div>
                <div className="text-sm text-foreground">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online status */}
      <div className="px-4 mt-3 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
            <span className="text-sm text-foreground">Статус</span>
          </div>
          <span className="text-sm font-medium text-green-400">Онлайн</span>
        </div>
      </div>
    </div>
  );
}
