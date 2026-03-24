import { useState } from 'react';
import { authApi } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_color: string;
}

interface AuthScreenProps {
  onAuth: (user: AuthUser) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'register') {
        data = await authApi.register({ username, display_name: displayName, password, phone });
      } else {
        data = await authApi.login({ username, password });
      }
      localStorage.setItem('pulse_token', data.token);
      localStorage.setItem('pulse_user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-52 h-52 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-40 h-40 rounded-full bg-cyan-600/8 blur-2xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-pulse flex items-center justify-center glow-purple mb-4">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Pulse</h1>
          <p className="text-muted-foreground text-sm mt-1">Быстрый и безопасный мессенджер</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 animate-scale-in">
          <div className="flex p-1 bg-secondary rounded-xl mb-5">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${mode === m ? 'gradient-pulse text-white glow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username</label>
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5 border border-border focus-within:border-primary/50 transition-colors">
                <span className="text-muted-foreground text-sm">@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  required
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              {mode === 'register' && <p className="text-[10px] text-muted-foreground mt-1">Только a-z, 0-9, _ · от 3 до 32 символов</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Отображаемое имя</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                  required
                  className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5 border border-border focus-within:border-primary/50 transition-colors">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground hover:text-foreground">
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={15} />
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Телефон (необязательно)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+7 999 000-00-00"
                  className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 outline-none transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <Icon name="AlertCircle" size={13} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-pulse text-white font-medium glow-sm hover:scale-[1.02] transition-transform disabled:opacity-60 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  {mode === 'login' ? 'Входим...' : 'Создаём аккаунт...'}
                </span>
              ) : mode === 'login' ? 'Войти' : 'Создать аккаунт 🚀'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Продолжая, вы соглашаетесь с{' '}
          <span className="text-primary cursor-pointer hover:underline">условиями использования</span>
        </p>
      </div>
    </div>
  );
}
