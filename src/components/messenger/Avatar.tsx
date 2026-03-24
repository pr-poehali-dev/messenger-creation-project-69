import { getAvatarColor } from './data';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 'w-8 h-8', text: 'text-xs', dot: 'w-2 h-2 border' },
  md: { box: 'w-10 h-10', text: 'text-sm', dot: 'w-2.5 h-2.5 border' },
  lg: { box: 'w-12 h-12', text: 'text-base', dot: 'w-3 h-3 border-2' },
  xl: { box: 'w-16 h-16', text: 'text-xl', dot: 'w-3.5 h-3.5 border-2' },
};

export default function Avatar({ name, size = 'md', online, className = '' }: AvatarProps) {
  const s = sizes[size];
  const isEmoji = /\p{Emoji}/u.test(name) && name.length <= 2;
  const color = isEmoji ? '#374151' : getAvatarColor(name);

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div
        className={`${s.box} ${s.text} rounded-full flex items-center justify-center font-semibold select-none`}
        style={{ background: isEmoji ? 'hsl(224 15% 18%)' : `${color}30`, color: isEmoji ? undefined : color, border: `1px solid ${color}25` }}
      >
        {name.slice(0, isEmoji ? 1 : 2)}
      </div>
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${s.dot} rounded-full border-[hsl(224_20%_8%)] ${online ? 'bg-green-400' : 'bg-gray-600'}`}
        />
      )}
    </div>
  );
}
