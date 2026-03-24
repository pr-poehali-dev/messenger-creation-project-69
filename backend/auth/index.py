"""
Аутентификация: регистрация, вход, проверка токена, выход, обновление профиля.
"""
import json, os, hashlib, secrets, re
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p70352826_messenger_creation_p')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

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

    # POST /register
    if method == 'POST' and path.endswith('/register'):
        username = (body.get('username') or '').strip().lower()
        display_name = (body.get('display_name') or '').strip()
        password = body.get('password') or ''
        phone = body.get('phone') or ''

        if not username or not display_name or not password:
            return resp(400, {'error': 'username, display_name и password обязательны'})
        if not re.match(r'^[a-z0-9_]{3,32}$', username):
            return resp(400, {'error': 'username: 3-32 символа, только a-z, 0-9, _'})
        if len(password) < 6:
            return resp(400, {'error': 'Пароль минимум 6 символов'})

        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s", (username,))
        if cur.fetchone():
            db.close()
            return resp(409, {'error': 'Такой username уже занят'})

        session_token = make_token()
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (username, display_name, phone, password_hash, session_token, online) VALUES (%s,%s,%s,%s,%s,true) RETURNING id",
            (username, display_name, phone, hash_password(password), session_token)
        )
        user_id = cur.fetchone()[0]
        db.commit()
        db.close()
        return resp(200, {'token': session_token, 'user': {'id': user_id, 'username': username, 'display_name': display_name, 'bio': '', 'avatar_color': '#8B5CF6'}})

    # POST /login
    if method == 'POST' and path.endswith('/login'):
        username = (body.get('username') or '').strip().lower()
        password = body.get('password') or ''
        if not username or not password:
            return resp(400, {'error': 'username и password обязательны'})

        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT id, username, display_name, bio, avatar_color, password_hash FROM {SCHEMA}.users WHERE username = %s", (username,))
        row = cur.fetchone()
        if not row or row[5] != hash_password(password):
            db.close()
            return resp(401, {'error': 'Неверный username или пароль'})

        new_token = make_token()
        cur.execute(f"UPDATE {SCHEMA}.users SET session_token=%s, online=true, last_seen=NOW() WHERE id=%s", (new_token, row[0]))
        db.commit()
        db.close()
        return resp(200, {'token': new_token, 'user': {'id': row[0], 'username': row[1], 'display_name': row[2], 'bio': row[3] or '', 'avatar_color': row[4] or '#8B5CF6'}})

    # GET /me
    if method == 'GET' and path.endswith('/me'):
        if not token:
            return resp(401, {'error': 'Нет токена'})
        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT id, username, display_name, bio, avatar_color, phone FROM {SCHEMA}.users WHERE session_token=%s", (token,))
        row = cur.fetchone()
        db.close()
        if not row:
            return resp(401, {'error': 'Токен недействителен'})
        return resp(200, {'user': {'id': row[0], 'username': row[1], 'display_name': row[2], 'bio': row[3] or '', 'avatar_color': row[4] or '#8B5CF6', 'phone': row[5] or ''}})

    # PUT /profile
    if method == 'PUT' and path.endswith('/profile'):
        if not token:
            return resp(401, {'error': 'Нет токена'})
        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE session_token=%s", (token,))
        row = cur.fetchone()
        if not row:
            db.close()
            return resp(401, {'error': 'Токен недействителен'})
        user_id = row[0]
        fields = []
        vals = []
        if 'display_name' in body and body['display_name'].strip():
            fields.append('display_name=%s'); vals.append(body['display_name'].strip())
        if 'bio' in body:
            fields.append('bio=%s'); vals.append(body['bio'])
        if 'avatar_color' in body:
            fields.append('avatar_color=%s'); vals.append(body['avatar_color'])
        if fields:
            vals.append(user_id)
            cur.execute(f"UPDATE {SCHEMA}.users SET {', '.join(fields)} WHERE id=%s", vals)
            db.commit()
        db.close()
        return resp(200, {'ok': True})

    # POST /logout
    if method == 'POST' and path.endswith('/logout'):
        if token:
            db = get_db()
            cur = db.cursor()
            cur.execute(f"UPDATE {SCHEMA}.users SET online=false, session_token=NULL, last_seen=NOW() WHERE session_token=%s", (token,))
            db.commit()
            db.close()
        return resp(200, {'ok': True})

    # GET /search?q=username
    if method == 'GET' and 'search' in path:
        if not token:
            return resp(401, {'error': 'Нет токена'})
        q = (event.get('queryStringParameters') or {}).get('q', '').strip().lower().lstrip('@')
        if not q:
            return resp(200, {'users': []})
        db = get_db()
        cur = db.cursor()
        cur.execute(
            f"SELECT id, username, display_name, bio, avatar_color, online, last_seen FROM {SCHEMA}.users WHERE username ILIKE %s OR display_name ILIKE %s LIMIT 20",
            (f'%{q}%', f'%{q}%')
        )
        rows = cur.fetchall()
        db.close()
        return resp(200, {'users': [
            {'id': r[0], 'username': r[1], 'display_name': r[2], 'bio': r[3] or '', 'avatar_color': r[4] or '#8B5CF6', 'online': r[5], 'last_seen': str(r[6])}
            for r in rows
        ]})

    return resp(404, {'error': 'Not found'})

def resp(status: int, data: dict) -> dict:
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}
