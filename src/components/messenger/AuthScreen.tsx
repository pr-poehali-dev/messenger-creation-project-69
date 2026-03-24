import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface AuthScreenProps {
  onAuth: (name: string) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'phone' | 'code' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('code'); }, 1000);
  };

  const handleCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === 'register') setStep('name');
      else onAuth('Пользователь');
    }, 800);
  };

  const handleName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(name); }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-cyan-600/8 blur-2xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-pulse flex items-center justify-center glow-purple mb-4">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Pulse</h1>
          <p className="text-muted-foreground text-sm mt-1">Быстрый и безопасный мессенджер</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 animate-scale-in">
          {/* Mode toggle */}
          {step === 'phone' && (
            <div className="flex p-1 bg-secondary rounded-xl mb-6">
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                    ${mode === m ? 'gradient-pulse text-white glow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {m === 'login' ? 'Войти' : 'Регистрация'}
                </button>
              ))}
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhone} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Номер телефона</label>
                <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-3 border border-border focus-within:border-primary/50 transition-colors">
                  <Icon name="Phone" size={16} className="text-muted-foreground flex-shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 999 000-00-00"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!phone.trim() || loading}
                className="w-full py-3 rounded-xl gradient-pulse text-white font-medium glow-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Отправка кода...
                  </span>
                ) : 'Получить код'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCode} className="space-y-4">
              <div className="text-center mb-2">
                <Icon name="MessageSquare" size={32} className="text-primary mx-auto mb-2" />
                <p className="text-sm text-foreground font-medium">Введите код из SMS</p>
                <p className="text-xs text-muted-foreground">Отправили на {phone}</p>
              </div>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.slice(0, 6))}
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                className="w-full bg-secondary rounded-xl px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-foreground border border-border focus:border-primary/50 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={code.length < 4 || loading}
                className="w-full py-3 rounded-xl gradient-pulse text-white font-medium glow-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Проверяем...
                  </span>
                ) : 'Подтвердить'}
              </button>
              <button type="button" onClick={() => setStep('phone')} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Изменить номер
              </button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleName} className="space-y-4">
              <div className="text-center mb-2">
                <Icon name="User" size={32} className="text-primary mx-auto mb-2" />
                <p className="text-sm text-foreground font-medium">Как вас зовут?</p>
                <p className="text-xs text-muted-foreground">Это имя увидят другие пользователи</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary/50 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="w-full py-3 rounded-xl gradient-pulse text-white font-medium glow-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Создаём профиль...
                  </span>
                ) : 'Начать общение 🚀'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Регистрируясь, вы соглашаетесь с{' '}
          <span className="text-primary cursor-pointer hover:underline">условиями использования</span>
        </p>
      </div>
    </div>
  );
}
