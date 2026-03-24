"""
Чаты: список, создание личного чата, история сообщений, отправка, отметка прочитанным.
"""
import json, os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p70352826_messenger_creation_p')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user(cur, token):
    cur.execute(f"SELECT id, username, display_name, avatar_color FROM {SCHEMA}.users WHERE session_token=%s", (token,))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    headers = event.get('headers') or {}
    token = headers.get('X-Session-Token') or headers.get('x-session-token') or ''
    params = event.get('queryStringParameters') or {}

    db = get_db()
    cur = db.cursor()
    me = get_user(cur, token)
    if not me:
        db.close()
        return resp(401, {'error': 'Не авторизован'})
    my_id = me[0]

    # GET /list — все чаты пользователя
    if method == 'GET' and path.endswith('/list'):
        cur.execute(f"""
            SELECT c.id, c.type, c.name, c.avatar,
                (SELECT text FROM {SCHEMA}.messages WHERE chat_id=c.id ORDER BY created_at DESC LIMIT 1) as last_msg,
                (SELECT created_at FROM {SCHEMA}.messages WHERE chat_id=c.id ORDER BY created_at DESC LIMIT 1) as last_time,
                (SELECT COUNT(*) FROM {SCHEMA}.messages WHERE chat_id=c.id AND sender_id != %s AND NOT (%s = ANY(read_by))) as unread,
                (SELECT u.id FROM {SCHEMA}.chat_members cm2
                 JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                 WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1) as partner_id,
                (SELECT u.display_name FROM {SCHEMA}.chat_members cm2
                 JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                 WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1) as partner_name,
                (SELECT u.online FROM {SCHEMA}.chat_members cm2
                 JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                 WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1) as partner_online,
                (SELECT u.avatar_color FROM {SCHEMA}.chat_members cm2
                 JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                 WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1) as partner_color,
                (SELECT u.username FROM {SCHEMA}.chat_members cm2
                 JOIN {SCHEMA}.users u ON u.id = cm2.user_id
                 WHERE cm2.chat_id = c.id AND cm2.user_id != %s LIMIT 1) as partner_username
            FROM {SCHEMA}.chats c
            JOIN {SCHEMA}.chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
            ORDER BY last_time DESC NULLS LAST
        """, (my_id, my_id, my_id, my_id, my_id, my_id, my_id, my_id))
        rows = cur.fetchall()
        db.close()
        chats = []
        for r in rows:
            if r[1] == 'personal':
                name = r[8] or 'Неизвестный'
                avatar = (r[8] or 'U')[:2].upper()
                color = r[10] or '#8B5CF6'
                online = r[9] or False
                partner_id = r[7]
                username = r[11] or ''
            else:
                name = r[2] or 'Группа'
                avatar = r[3] or '👥'
                color = '#8B5CF6'
                online = False
                partner_id = None
                username = ''
            chats.append({
                'id': r[0], 'type': r[1], 'name': name, 'avatar': avatar,
                'color': color, 'online': online, 'partner_id': partner_id,
                'username': username,
                'last_message': r[4] or '', 'last_time': str(r[5]) if r[5] else '',
                'unread': int(r[6])
            })
        return resp(200, {'chats': chats})

    # POST /create — создать личный чат с пользователем
    if method == 'POST' and path.endswith('/create'):
        partner_id = body.get('partner_id')
        if not partner_id:
            return resp(400, {'error': 'partner_id обязателен'})

        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE id=%s", (partner_id,))
        if not cur.fetchone():
            db.close()
            return resp(404, {'error': 'Пользователь не найден'})

        # Check if chat already exists
        cur.execute(f"""
            SELECT c.id FROM {SCHEMA}.chats c
            JOIN {SCHEMA}.chat_members cm1 ON cm1.chat_id=c.id AND cm1.user_id=%s
            JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id=c.id AND cm2.user_id=%s
            WHERE c.type='personal' LIMIT 1
        """, (my_id, partner_id))
        existing = cur.fetchone()
        if existing:
            db.close()
            return resp(200, {'chat_id': existing[0], 'existed': True})

        cur.execute(f"INSERT INTO {SCHEMA}.chats (type, created_by) VALUES ('personal', %s) RETURNING id", (my_id,))
        chat_id = cur.fetchone()[0]
        cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES (%s,%s),(%s,%s)", (chat_id, my_id, chat_id, partner_id))
        db.commit()
        db.close()
        return resp(200, {'chat_id': chat_id, 'existed': False})

    # GET /messages?chat_id=X&offset=0
    if method == 'GET' and 'messages' in path:
        chat_id = params.get('chat_id')
        offset = int(params.get('offset', 0))
        if not chat_id:
            db.close()
            return resp(400, {'error': 'chat_id обязателен'})

        cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id=%s AND user_id=%s", (chat_id, my_id))
        if not cur.fetchone():
            db.close()
            return resp(403, {'error': 'Нет доступа к чату'})

        cur.execute(f"""
            SELECT m.id, m.sender_id, u.display_name, u.avatar_color, m.text, m.read_by, m.created_at
            FROM {SCHEMA}.messages m
            JOIN {SCHEMA}.users u ON u.id = m.sender_id
            WHERE m.chat_id = %s
            ORDER BY m.created_at ASC
            LIMIT 50 OFFSET %s
        """, (chat_id, offset))
        rows = cur.fetchall()

        # Mark as read
        cur.execute(f"""
            UPDATE {SCHEMA}.messages SET read_by = array_append(read_by, %s)
            WHERE chat_id=%s AND sender_id!=%s AND NOT (%s = ANY(read_by))
        """, (my_id, chat_id, my_id, my_id))
        db.commit()
        db.close()

        return resp(200, {'messages': [
            {
                'id': r[0], 'sender_id': r[1], 'sender_name': r[2],
                'sender_color': r[3] or '#8B5CF6',
                'text': r[4], 'read': my_id in (r[5] or []),
                'is_mine': r[1] == my_id,
                'time': r[6].strftime('%H:%M') if r[6] else ''
            }
            for r in rows
        ]})

    # POST /send
    if method == 'POST' and path.endswith('/send'):
        chat_id = body.get('chat_id')
        text = (body.get('text') or '').strip()
        if not chat_id or not text:
            db.close()
            return resp(400, {'error': 'chat_id и text обязательны'})

        cur.execute(f"SELECT 1 FROM {SCHEMA}.chat_members WHERE chat_id=%s AND user_id=%s", (chat_id, my_id))
        if not cur.fetchone():
            db.close()
            return resp(403, {'error': 'Нет доступа'})

        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text, read_by) VALUES (%s,%s,%s,%s) RETURNING id, created_at",
            (chat_id, my_id, text, [my_id])
        )
        msg_id, created_at = cur.fetchone()
        db.commit()
        db.close()
        return resp(200, {
            'message': {'id': msg_id, 'sender_id': my_id, 'sender_name': me[2],
                        'sender_color': me[3] or '#8B5CF6', 'text': text,
                        'is_mine': True, 'read': False, 'time': created_at.strftime('%H:%M')}
        })

    db.close()
    return resp(404, {'error': 'Not found'})

def resp(status: int, data: dict) -> dict:
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}
