export type Chat = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  pinned?: boolean;
  type: 'personal' | 'group' | 'channel';
};

export type Message = {
  id: string;
  chatId: string;
  text: string;
  time: string;
  sender: 'me' | 'other';
  senderName?: string;
  read: boolean;
  reactions?: { emoji: string; count: number }[];
};

export type Contact = {
  id: string;
  name: string;
  avatar: string;
  username: string;
  online: boolean;
  lastSeen?: string;
  phone?: string;
};

export type Notification = {
  id: string;
  title: string;
  text: string;
  time: string;
  read: boolean;
  avatar: string;
  type: 'message' | 'mention' | 'reaction' | 'system';
};

export const MOCK_CHATS: Chat[] = [
  { id: '1', name: 'Алексей Громов', avatar: 'АГ', lastMessage: 'Отлично, встретимся в 18:00!', time: '14:32', unread: 3, online: true, pinned: true, type: 'personal' },
  { id: '2', name: 'Команда дизайна', avatar: '🎨', lastMessage: 'Макеты готовы к ревью', time: '13:15', unread: 12, online: false, pinned: true, type: 'group' },
  { id: '3', name: 'Мария Соколова', avatar: 'МС', lastMessage: 'Можешь прислать файлы?', time: '12:48', unread: 0, online: true, type: 'personal' },
  { id: '4', name: 'Dev Team', avatar: '💻', lastMessage: 'Деплой прошёл успешно 🚀', time: '11:30', unread: 5, online: false, type: 'group' },
  { id: '5', name: 'Игорь Петров', avatar: 'ИП', lastMessage: 'Понял, сделаю завтра', time: '10:22', unread: 0, online: false, type: 'personal' },
  { id: '6', name: 'Tech News', avatar: '📡', lastMessage: 'Apple представила новый чип M4 Ultra', time: 'Вчера', unread: 28, online: false, type: 'channel' },
  { id: '7', name: 'Анна Ковалёва', avatar: 'АК', lastMessage: 'Спасибо большое! ❤️', time: 'Вчера', unread: 0, online: true, type: 'personal' },
  { id: '8', name: 'Маркетинг', avatar: '📊', lastMessage: 'Отчёт за Q1 приложен', time: 'Вчера', unread: 2, online: false, type: 'group' },
  { id: '9', name: 'Дмитрий Волков', avatar: 'ДВ', lastMessage: 'Ок, договорились!', time: 'Пн', unread: 0, online: false, type: 'personal' },
  { id: '10', name: 'Pulse Updates', avatar: '⚡', lastMessage: 'Новая версия 2.0 доступна', time: 'Пн', unread: 1, online: false, type: 'channel' },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', chatId: '1', text: 'Привет! Как дела?', time: '14:10', sender: 'other', senderName: 'Алексей', read: true },
    { id: 'm2', chatId: '1', text: 'Отлично! Ты свободен сегодня вечером?', time: '14:12', sender: 'me', read: true },
    { id: 'm3', chatId: '1', text: 'Да, есть время после 17:00', time: '14:15', sender: 'other', senderName: 'Алексей', read: true },
    { id: 'm4', chatId: '1', text: 'Может встретимся, обсудим проект?', time: '14:20', sender: 'me', read: true },
    { id: 'm5', chatId: '1', text: 'Конечно! Где?', time: '14:25', sender: 'other', senderName: 'Алексей', read: true, reactions: [{ emoji: '👍', count: 1 }] },
    { id: 'm6', chatId: '1', text: 'Кофейня у метро? Та, где мы были в прошлый раз', time: '14:28', sender: 'me', read: true },
    { id: 'm7', chatId: '1', text: 'Отлично, встретимся в 18:00!', time: '14:32', sender: 'other', senderName: 'Алексей', read: false },
  ],
  '2': [
    { id: 'm1', chatId: '2', text: 'Всем привет! Начинаем ревью?', time: '13:00', sender: 'other', senderName: 'Катя', read: true },
    { id: 'm2', chatId: '2', text: 'Да, я готов', time: '13:05', sender: 'me', read: true },
    { id: 'm3', chatId: '2', text: 'Макеты готовы к ревью', time: '13:15', sender: 'other', senderName: 'Артём', read: false },
  ],
  '3': [
    { id: 'm1', chatId: '3', text: 'Привет, Мария!', time: '12:30', sender: 'me', read: true },
    { id: 'm2', chatId: '3', text: 'Привет! Как проект?', time: '12:35', sender: 'other', senderName: 'Мария', read: true },
    { id: 'm3', chatId: '3', text: 'Можешь прислать файлы?', time: '12:48', sender: 'other', senderName: 'Мария', read: false },
  ],
};

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Алексей Громов', avatar: 'АГ', username: '@alexgromov', online: true, phone: '+7 999 123-45-67' },
  { id: '2', name: 'Мария Соколова', avatar: 'МС', username: '@maria_s', online: true, phone: '+7 916 234-56-78' },
  { id: '3', name: 'Игорь Петров', avatar: 'ИП', username: '@igor_p', online: false, lastSeen: 'был(а) 2 часа назад', phone: '+7 903 345-67-89' },
  { id: '4', name: 'Анна Ковалёва', avatar: 'АК', username: '@anna_k', online: true, phone: '+7 925 456-78-90' },
  { id: '5', name: 'Дмитрий Волков', avatar: 'ДВ', username: '@dmitry_v', online: false, lastSeen: 'был(а) вчера', phone: '+7 977 567-89-01' },
  { id: '6', name: 'Елена Смирнова', avatar: 'ЕС', username: '@elena_sm', online: false, lastSeen: 'был(а) 3 дня назад', phone: '+7 968 678-90-12' },
  { id: '7', name: 'Кирилл Новиков', avatar: 'КН', username: '@kirill_n', online: true, phone: '+7 911 789-01-23' },
  { id: '8', name: 'Ольга Тихонова', avatar: 'ОТ', username: '@olga_t', online: false, lastSeen: 'был(а) неделю назад', phone: '+7 926 890-12-34' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Алексей Громов', text: 'Отлично, встретимся в 18:00!', time: '14:32', read: false, avatar: 'АГ', type: 'message' },
  { id: '2', title: 'Команда дизайна', text: 'Артём: Макеты готовы к ревью', time: '13:15', read: false, avatar: '🎨', type: 'message' },
  { id: '3', title: 'Dev Team', text: 'Катя упомянула вас: @user деплой прошёл!', time: '11:30', read: false, avatar: '💻', type: 'mention' },
  { id: '4', title: 'Алексей Громов', text: 'Поставил реакцию 👍 на ваше сообщение', time: '10:45', read: true, avatar: 'АГ', type: 'reaction' },
  { id: '5', title: 'Pulse', text: 'Добро пожаловать в Pulse! 🎉', time: 'Вчера', read: true, avatar: '⚡', type: 'system' },
  { id: '6', title: 'Маркетинг', text: 'Иван: Отчёт за Q1 приложен', time: 'Вчера', read: true, avatar: '📊', type: 'message' },
];

export const AVATAR_COLORS: Record<string, string> = {
  'А': '#8B5CF6',
  'Б': '#EC4899',
  'В': '#06B6D4',
  'Г': '#10B981',
  'Д': '#F59E0B',
  'Е': '#EF4444',
  'И': '#8B5CF6',
  'К': '#EC4899',
  'М': '#06B6D4',
  'О': '#10B981',
};

export function getAvatarColor(name: string): string {
  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#A855F7'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
