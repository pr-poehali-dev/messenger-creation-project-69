const URLS = {
  auth: 'https://functions.poehali.dev/ce2f2574-b919-4f2c-a13c-dfb3da6ecfb0',
  chats: 'https://functions.poehali.dev/663d036c-7b43-41f9-88fc-69a8dce48cf3',
  channels: 'https://functions.poehali.dev/57ad61fe-fd08-41e2-878b-71c7ba0941bf',
  calls: 'https://functions.poehali.dev/9e4f810c-daf9-4fa3-9203-9d9c7069f547',
};

function getToken(): string {
  return localStorage.getItem('pulse_token') || '';
}

async function request(base: keyof typeof URLS, path: string, options: RequestInit = {}) {
  const url = URLS[base] + path;
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Session-Token': token } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

// AUTH
export const authApi = {
  register: (body: { username: string; display_name: string; password: string; phone?: string }) =>
    request('auth', '/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { username: string; password: string }) =>
    request('auth', '/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('auth', '/me'),
  updateProfile: (body: { display_name?: string; bio?: string; avatar_color?: string }) =>
    request('auth', '/profile', { method: 'PUT', body: JSON.stringify(body) }),
  logout: () => request('auth', '/logout', { method: 'POST' }),
  search: (q: string) => request('auth', `/search?q=${encodeURIComponent(q)}`),
};

// CHATS
export const chatsApi = {
  list: () => request('chats', '/list'),
  create: (partner_id: number) =>
    request('chats', '/create', { method: 'POST', body: JSON.stringify({ partner_id }) }),
  messages: (chat_id: number, offset = 0) =>
    request('chats', `/messages?chat_id=${chat_id}&offset=${offset}`),
  send: (chat_id: number, text: string) =>
    request('chats', '/send', { method: 'POST', body: JSON.stringify({ chat_id, text }) }),
};

// CHANNELS
export const channelsApi = {
  list: () => request('channels', '/list'),
  search: (q: string) => request('channels', `/search?q=${encodeURIComponent(q)}`),
  create: (body: { name: string; username: string; description?: string; avatar?: string }) =>
    request('channels', '/create', { method: 'POST', body: JSON.stringify(body) }),
  posts: (channel_id: number) => request('channels', `/posts?channel_id=${channel_id}`),
  post: (channel_id: number, text: string) =>
    request('channels', '/post', { method: 'POST', body: JSON.stringify({ channel_id, text }) }),
  subscribe: (channel_id: number) =>
    request('channels', '/subscribe', { method: 'POST', body: JSON.stringify({ channel_id }) }),
  unsubscribe: (channel_id: number) =>
    request('channels', '/unsubscribe', { method: 'POST', body: JSON.stringify({ channel_id }) }),
};

// CALLS
export const callsApi = {
  history: () => request('calls', '/history'),
  initiate: (callee_id: number, type: 'audio' | 'video' = 'audio') =>
    request('calls', '/initiate', { method: 'POST', body: JSON.stringify({ callee_id, type }) }),
  end: (call_id: number, status: string, duration_sec: number) =>
    request('calls', '/end', { method: 'POST', body: JSON.stringify({ call_id, status, duration_sec }) }),
};
