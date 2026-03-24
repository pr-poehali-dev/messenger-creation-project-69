import { useState } from 'react';
import { MOCK_CONTACTS, Contact } from './data';
import Avatar from './Avatar';
import Icon from '@/components/ui/icon';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);

  const filtered = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const online = filtered.filter(c => c.online);
  const offline = filtered.filter(c => !c.online);

  const Section = ({ title, contacts }: { title: string; contacts: Contact[] }) => (
    contacts.length > 0 ? (
      <div className="mb-4">
        <div className="px-1 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title} — {contacts.length}
        </div>
        <div className="space-y-0.5">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelected(selected?.id === contact.id ? null : contact)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                ${selected?.id === contact.id ? 'bg-primary/15 border border-primary/25' : 'hover:bg-secondary/50'}`}
            >
              <Avatar name={contact.avatar} size="md" online={contact.online} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.username}</div>
              </div>
              {contact.online && (
                <span className="text-xs text-green-400 font-medium">онлайн</span>
              )}
            </button>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold gradient-text">Контакты</h2>
            <button className="w-8 h-8 rounded-xl gradient-pulse flex items-center justify-center text-white glow-sm hover:scale-105 transition-transform">
              <Icon name="UserPlus" size={15} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
            <Icon name="Search" size={15} className="text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск контактов..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <Section title="Онлайн" contacts={online} />
          <Section title="Не в сети" contacts={offline} />
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Icon name="UserX" size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Контактов не найдено</p>
            </div>
          )}
        </div>

        {/* Contact detail panel */}
        {selected && (
          <div className="border-t border-border p-4 animate-fade-in flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={selected.avatar} size="lg" online={selected.online} />
              <div>
                <div className="font-semibold text-foreground">{selected.name}</div>
                <div className="text-xs text-muted-foreground">{selected.username}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selected.online ? <span className="text-green-400">онлайн</span> : selected.lastSeen}
                </div>
              </div>
            </div>
            {selected.phone && (
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <Icon name="Phone" size={12} />
                {selected.phone}
              </div>
            )}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl gradient-pulse text-white text-sm font-medium glow-sm hover:scale-105 transition-transform">
                <Icon name="MessageCircle" size={15} />
                Написать
              </button>
              <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Phone" size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Video" size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
