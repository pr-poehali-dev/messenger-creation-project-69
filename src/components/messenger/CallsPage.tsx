import { useState, useEffect } from 'react';
import { callsApi } from '@/lib/api';
import Icon from '@/components/ui/icon';

interface CallRecord {
  id: number;
  type: string;
  status: string;
  duration_sec: number;
  time: string;
  is_outgoing: boolean;
  partner_name: string;
  partner_color: string;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callsApi.history().then(d => setCalls(d.calls)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec} сек`;
    return `${Math.floor(sec / 60)} мин ${sec % 60} сек`;
  };

  const getStatusIcon = (call: CallRecord) => {
    if (call.status === 'missed') return { icon: 'PhoneMissed', color: 'text-rose-400' };
    if (call.is_outgoing) return { icon: 'PhoneOutgoing', color: 'text-primary' };
    return { icon: 'PhoneIncoming', color: 'text-green-400' };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h2 className="text-base font-bold gradient-text">Звонки</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading && (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" size={20} className="text-primary animate-spin" />
          </div>
        )}
        {!loading && calls.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Icon name="Phone" size={40} className="mb-3 opacity-25" />
            <p className="text-sm">История звонков пуста</p>
            <p className="text-xs mt-1 text-center px-6">Нажмите иконку телефона в чате, чтобы позвонить</p>
          </div>
        )}

        <div className="space-y-0.5">
          {calls.map(call => {
            const { icon, color } = getStatusIcon(call);
            const initials = call.partner_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={call.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/50 transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                  style={{ background: `${call.partner_color}25`, color: call.partner_color }}>
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{call.partner_name}</div>
                  <div className={`flex items-center gap-1 text-xs ${color}`}>
                    <Icon name={icon} size={11} />
                    {call.status === 'missed' ? 'Пропущенный' : call.is_outgoing ? 'Исходящий' : 'Входящий'}
                    {call.duration_sec > 0 && <span className="text-muted-foreground ml-1">· {formatDuration(call.duration_sec)}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{call.time}</div>
                  <div className="text-xs text-muted-foreground">{call.type === 'video' ? '📹 Видео' : '📞 Аудио'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
