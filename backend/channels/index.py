"""
Каналы: список, создание, подписка, публикация постов, просмотр ленты.
"""
import json, os, re
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
    cur.execute(f"SELECT id, display_name FROM {SCHEMA}.users WHERE session_token=%s", (token,))
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

    # GET /list — мои каналы + подписки
    if method == 'GET' and path.endswith('/list'):
        cur.execute(f"""
            SELECT c.id, c.name, c.username, c.description, c.avatar, c.subscriber_count, c.owner_id,
                   (c.owner_id = %s) as is_owner
            FROM {SCHEMA}.channels c
            LEFT JOIN {SCHEMA}.channel_subscriptions cs ON cs.channel_id=c.id AND cs.user_id=%s
            WHERE c.owner_id=%s OR cs.user_id=%s
            ORDER BY c.subscriber_count DESC
        """, (my_id, my_id, my_id, my_id))
        rows = cur.fetchall()
        db.close()
        return resp(200, {'channels': [
            {'id': r[0], 'name': r[1], 'username': r[2], 'description': r[3],
             'avatar': r[4], 'subscriber_count': r[5], 'is_owner': r[7]}
            for r in rows
        ]})

    # GET /posts?channel_id=X
    if method == 'GET' and 'posts' in path:
        channel_id = params.get('channel_id')
        if not channel_id:
            db.close()
            return resp(400, {'error': 'channel_id обязателен'})
        cur.execute(f"""
            SELECT p.id, p.text, p.views, p.created_at, u.display_name
            FROM {SCHEMA}.channel_posts p
            JOIN {SCHEMA}.users u ON u.id=p.author_id
            WHERE p.channel_id=%s ORDER BY p.created_at DESC LIMIT 30
        """, (channel_id,))
        rows = cur.fetchall()
        # increment views
        if rows:
            ids = [r[0] for r in rows]
            cur.execute(f"UPDATE {SCHEMA}.channel_posts SET views=views+1 WHERE id = ANY(%s)", (ids,))
            db.commit()
        db.close()
        return resp(200, {'posts': [
            {'id': r[0], 'text': r[1], 'views': r[2], 'time': r[3].strftime('%d.%m %H:%M'), 'author': r[4]}
            for r in rows
        ]})

    # POST /create
    if method == 'POST' and path.endswith('/create'):
        name = (body.get('name') or '').strip()
        username = (body.get('username') or '').strip().lower().lstrip('@')
        description = body.get('description') or ''
        avatar = body.get('avatar') or '📡'
        if not name or not username:
            db.close()
            return resp(400, {'error': 'name и username обязательны'})
        if not re.match(r'^[a-z0-9_]{3,32}$', username):
            db.close()
            return resp(400, {'error': 'username: 3-32 символа, только a-z, 0-9, _'})

        cur.execute(f"SELECT id FROM {SCHEMA}.channels WHERE username=%s", (username,))
        if cur.fetchone():
            db.close()
            return resp(409, {'error': 'Такой username канала уже занят'})

        cur.execute(
            f"INSERT INTO {SCHEMA}.channels (name, username, description, avatar, owner_id) VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (name, username, description, avatar, my_id)
        )
        ch_id = cur.fetchone()[0]
        cur.execute(f"INSERT INTO {SCHEMA}.channel_subscriptions (channel_id, user_id) VALUES (%s,%s)", (ch_id, my_id))
        db.commit()
        db.close()
        return resp(200, {'channel': {'id': ch_id, 'name': name, 'username': username, 'description': description, 'avatar': avatar, 'subscriber_count': 0, 'is_owner': True}})

    # POST /subscribe
    if method == 'POST' and path.endswith('/subscribe'):
        channel_id = body.get('channel_id')
        if not channel_id:
            db.close()
            return resp(400, {'error': 'channel_id обязателен'})
        cur.execute(f"SELECT 1 FROM {SCHEMA}.channel_subscriptions WHERE channel_id=%s AND user_id=%s", (channel_id, my_id))
        if not cur.fetchone():
            cur.execute(f"INSERT INTO {SCHEMA}.channel_subscriptions (channel_id, user_id) VALUES (%s,%s)", (channel_id, my_id))
            cur.execute(f"UPDATE {SCHEMA}.channels SET subscriber_count=subscriber_count+1 WHERE id=%s", (channel_id,))
            db.commit()
        db.close()
        return resp(200, {'ok': True})

    # POST /unsubscribe
    if method == 'POST' and path.endswith('/unsubscribe'):
        channel_id = body.get('channel_id')
        if not channel_id:
            db.close()
            return resp(400, {'error': 'channel_id обязателен'})
        cur.execute(f"UPDATE {SCHEMA}.channels SET subscriber_count=GREATEST(0, subscriber_count-1) WHERE id=%s", (channel_id,))
        db.commit()
        db.close()
        return resp(200, {'ok': True})

    # POST /post — опубликовать пост
    if method == 'POST' and path.endswith('/post'):
        channel_id = body.get('channel_id')
        text = (body.get('text') or '').strip()
        if not channel_id or not text:
            db.close()
            return resp(400, {'error': 'channel_id и text обязательны'})
        cur.execute(f"SELECT id FROM {SCHEMA}.channels WHERE id=%s AND owner_id=%s", (channel_id, my_id))
        if not cur.fetchone():
            db.close()
            return resp(403, {'error': 'Нет прав на этот канал'})
        cur.execute(
            f"INSERT INTO {SCHEMA}.channel_posts (channel_id, author_id, text) VALUES (%s,%s,%s) RETURNING id, created_at",
            (channel_id, my_id, text)
        )
        post_id, created_at = cur.fetchone()
        db.commit()
        db.close()
        return resp(200, {'post': {'id': post_id, 'text': text, 'views': 0, 'time': created_at.strftime('%d.%m %H:%M'), 'author': me[1]}})

    # GET /search?q=...
    if method == 'GET' and 'search' in path:
        q = params.get('q', '').strip().lower().lstrip('@')
        if not q:
            db.close()
            return resp(200, {'channels': []})
        cur.execute(f"""
            SELECT c.id, c.name, c.username, c.description, c.avatar, c.subscriber_count,
                   (EXISTS(SELECT 1 FROM {SCHEMA}.channel_subscriptions WHERE channel_id=c.id AND user_id=%s)) as subscribed
            FROM {SCHEMA}.channels c
            WHERE c.name ILIKE %s OR c.username ILIKE %s
            LIMIT 20
        """, (my_id, f'%{q}%', f'%{q}%'))
        rows = cur.fetchall()
        db.close()
        return resp(200, {'channels': [
            {'id': r[0], 'name': r[1], 'username': r[2], 'description': r[3], 'avatar': r[4], 'subscriber_count': r[5], 'subscribed': r[6]}
            for r in rows
        ]})

    db.close()
    return resp(404, {'error': 'Not found'})

def resp(status: int, data: dict) -> dict:
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}
