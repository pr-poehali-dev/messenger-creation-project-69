import { useState } from 'react';
import { authApi } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface ProfileUser {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_color: string;
  phone?: string;
}

interface ProfilePageProps {
  user: ProfileUser;
  onUpdate: (u: ProfileUser) => void;
}

const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7', '#14B8A6', '#F97316'];

export default function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.display_name);
  const [bio, setBio] = useState(user.bio);
  const [color, setColor] = useState(user.avatar_color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await authApi.updateProfile({ display_name: name, bio, avatar_color: color });
      const updated = { ...user, display_name: name, bio, avatar_color: color };
      localStorage.setItem('pulse_user', JSON.stringify(updated));
      onUpdate(updated);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const initials = user.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Cover */}
      <div className="relative flex-shrink-0">
        <div className="h-24 gradient-pulse relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-8">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-bold shadow-lg"
                style={{ background: `${color}25`, borderColor: `${color}60`, color }}
              >
                {initials}
              </div>
            </div>
            <button
              onClick={() => { if (editing) save(); else setEditing(true); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${editing ? 'gradient-pulse text-white glow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {saving ? <Icon name="Loader2" size={13} className="animate-spin" /> : editing ? 'Сохранить' : 'Изменить'}
            </button>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50"
                placeholder="Имя" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary/50 resize-none"
                placeholder="О себе" />
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Цвет аватара</p>
                <div className="flex gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-rose-400">{error}</p>}
            </div>
          ) : (
            <div className="mt-3">
              <h2 className="font-bold text-foreground text-base">{user.display_name}</h2>
              <p className="text-xs text-primary">@{user.username}</p>
              {user.bio && <p className="text-xs text-muted-foreground mt-1">{user.bio}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {[
            user.phone && { icon: 'Phone', label: 'Телефон', value: user.phone },
            { icon: 'AtSign', label: 'Username', value: `@${user.username}` },
            { icon: 'Calendar', label: 'В Pulse с', value: 'Март 2026' },
          ].filter(Boolean).map((item, i, arr) => item && (
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

      {/* Status */}
      <div className="px-4 pb-4">
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
