import Icon from '@/components/ui/icon';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Поиск...' }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 border border-transparent focus-within:border-primary/30 transition-all">
      <Icon name="Search" size={15} className="text-muted-foreground flex-shrink-0" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
}
