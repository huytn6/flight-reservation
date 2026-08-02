import json
import uuid
from utils.date_utils import utcnow_iso


def log(db, user_id, action, resource, resource_id=None, details=None, ip=None):
    db.execute(
        "INSERT INTO audit_logs(id,user_id,action,resource,resource_id,details_json,ip_address,created_at) "
        "VALUES(?,?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), user_id, action, resource, resource_id,
         json.dumps(details) if details else None, ip, utcnow_iso())
    )


def list_logs(db, resource=None):
    if resource:
        return db.execute(
            "SELECT * FROM audit_logs WHERE resource=? ORDER BY created_at DESC", (resource,)
        ).fetchall()
    return db.execute("SELECT * FROM audit_logs ORDER BY created_at DESC").fetchall()
