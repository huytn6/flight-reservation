import uuid
from utils.date_utils import utcnow_iso


def list_contents(db, ctype=None, is_published=1):
    if ctype:
        return db.execute(
            "SELECT * FROM contents WHERE content_type=? AND is_published=? ORDER BY created_at DESC",
            (ctype, is_published)
        ).fetchall()
    return db.execute(
        "SELECT * FROM contents WHERE is_published=? ORDER BY content_type, created_at DESC",
        (is_published,)
    ).fetchall()


def list_contents_admin(db, ctype=None):
    if ctype:
        return db.execute(
            "SELECT * FROM contents WHERE content_type=? ORDER BY created_at DESC", (ctype,)
        ).fetchall()
    return db.execute("SELECT * FROM contents ORDER BY content_type, created_at DESC").fetchall()


def find_content(db, content_id):
    return db.execute("SELECT * FROM contents WHERE id=?", (content_id,)).fetchone()


def find_content_by_slug(db, slug):
    return db.execute("SELECT * FROM contents WHERE slug=?", (slug,)).fetchone()


def create_content(db, cid, data: dict):
    now = utcnow_iso()
    db.execute(
        "INSERT INTO contents(id,slug,title,body,content_type,is_published,created_at,updated_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (
            cid,
            data['slug'],
            data['title'],
            data['body'],
            data.get('content_type', data.get('type', 'PAGE')),
            1 if data.get('is_published', True) else 0,
            now,
            now,
        )
    )


def update_content(db, content_id, updates: dict):
    now = utcnow_iso()
    updates = dict(updates)
    updates['updated_at'] = now
    set_clause = ', '.join(f'{k}=?' for k in updates)
    db.execute(f"UPDATE contents SET {set_clause} WHERE id=?", (*updates.values(), content_id))


def delete_content(db, content_id):
    db.execute("DELETE FROM contents WHERE id=?", (content_id,))
