
CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  phone VARCHAR(20),
  bio TEXT DEFAULT '',
  avatar_color VARCHAR(16) DEFAULT '#8B5CF6',
  password_hash VARCHAR(255) NOT NULL,
  session_token VARCHAR(64),
  online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.chats (
  id SERIAL PRIMARY KEY,
  type VARCHAR(16) NOT NULL DEFAULT 'personal',
  name VARCHAR(128),
  avatar VARCHAR(8),
  created_by INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.chat_members (
  chat_id INT REFERENCES t_p70352826_messenger_creation_p.chats(id),
  user_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.messages (
  id SERIAL PRIMARY KEY,
  chat_id INT REFERENCES t_p70352826_messenger_creation_p.chats(id),
  sender_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  text TEXT NOT NULL,
  read_by INT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.channels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  username VARCHAR(32) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  avatar VARCHAR(8) DEFAULT '📡',
  owner_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  subscriber_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.channel_posts (
  id SERIAL PRIMARY KEY,
  channel_id INT REFERENCES t_p70352826_messenger_creation_p.channels(id),
  author_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  text TEXT NOT NULL,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.channel_subscriptions (
  channel_id INT REFERENCES t_p70352826_messenger_creation_p.channels(id),
  user_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p70352826_messenger_creation_p.calls (
  id SERIAL PRIMARY KEY,
  caller_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  callee_id INT REFERENCES t_p70352826_messenger_creation_p.users(id),
  status VARCHAR(16) DEFAULT 'missed',
  duration_sec INT DEFAULT 0,
  type VARCHAR(8) DEFAULT 'audio',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON t_p70352826_messenger_creation_p.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON t_p70352826_messenger_creation_p.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON t_p70352826_messenger_creation_p.chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_posts_channel_id ON t_p70352826_messenger_creation_p.channel_posts(channel_id);
