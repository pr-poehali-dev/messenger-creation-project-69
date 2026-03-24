"""
Звонки: история звонков, инициация, логирование результата.
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

    db = get_db()
    cur = db.cursor()
    me = get_user(cur, token)
    if not me:
        db.close()
        return resp(401, {'error': 'Не авторизован'})
    my_id = me[0]

    # GET /history — история звонков
    if method == 'GET' and path.endswith('/history'):
        cur.execute(f"""
            SELECT c.id, c.type, c.status, c.duration_sec, c.created_at,
                   u1.display_name as caller_name, u1.avatar_color as caller_color,
                   u2.display_name as callee_name, u2.avatar_color as callee_color,
                   c.caller_id, c.callee_id
            FROM {SCHEMA}.calls c
            JOIN {SCHEMA}.users u1 ON u1.id=c.caller_id
            JOIN {SCHEMA}.users u2 ON u2.id=c.callee_id
            WHERE c.caller_id=%s OR c.callee_id=%s
            ORDER BY c.created_at DESC LIMIT 30
        """, (my_id, my_id))
        rows = cur.fetchall()
        db.close()
        return resp(200, {'calls': [
            {
                'id': r[0], 'type': r[1], 'status': r[2], 'duration_sec': r[3],
                'time': r[4].strftime('%d.%m %H:%M'),
                'is_outgoing': r[9] == my_id,
                'partner_name': r[7] if r[9] == my_id else r[5],
                'partner_color': r[8] if r[9] == my_id else r[6],
            }
            for r in rows
        ]})

    # POST /initiate — начать звонок (записать в лог)
    if method == 'POST' and path.endswith('/initiate'):
        callee_id = body.get('callee_id')
        call_type = body.get('type', 'audio')
        if not callee_id:
            db.close()
            return resp(400, {'error': 'callee_id обязателен'})

        cur.execute(f"SELECT id, display_name, online FROM {SCHEMA}.users WHERE id=%s", (callee_id,))
        callee = cur.fetchone()
        if not callee:
            db.close()
            return resp(404, {'error': 'Пользователь не найден'})

        cur.execute(
            f"INSERT INTO {SCHEMA}.calls (caller_id, callee_id, type, status) VALUES (%s,%s,%s,'initiated') RETURNING id",
            (my_id, callee_id, call_type)
        )
        call_id = cur.fetchone()[0]
        db.commit()
        db.close()
        return resp(200, {
            'call_id': call_id,
            'callee': {'id': callee[0], 'display_name': callee[1], 'online': callee[2]}
        })

    # POST /end — завершить звонок
    if method == 'POST' and path.endswith('/end'):
        call_id = body.get('call_id')
        status = body.get('status', 'answered')
        duration = body.get('duration_sec', 0)
        if not call_id:
            db.close()
            return resp(400, {'error': 'call_id обязателен'})

        cur.execute(
            f"UPDATE {SCHEMA}.calls SET status=%s, duration_sec=%s WHERE id=%s AND (caller_id=%s OR callee_id=%s)",
            (status, duration, call_id, my_id, my_id)
        )
        db.commit()
        db.close()
        return resp(200, {'ok': True})

    db.close()
    return resp(404, {'error': 'Not found'})

def resp(status: int, data: dict) -> dict:
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}
