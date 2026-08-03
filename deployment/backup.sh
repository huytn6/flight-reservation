#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/opt/flight-reservation}"
REPO_DIR="${APP_ROOT}/repo"
ENV_FILE="${APP_ROOT}/shared/.env"
BACKUP_DIR="${APP_ROOT}/backups"

mkdir -p "${BACKUP_DIR}"
set -a
source "${ENV_FILE}"
set +a

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FINAL_FILE="${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"
TEMP_FILE="${FINAL_FILE}.tmp"

cd "${REPO_DIR}"
docker compose --env-file "${ENV_FILE}" exec -T mysql \
  mysqldump --host=127.0.0.1 --protocol=TCP --ssl-mode=DISABLED \
  --single-transaction --routines --triggers --no-tablespaces \
  -u"${MYSQL_MIGRATOR_USER}" -p"${MYSQL_MIGRATOR_PASSWORD}" \
  "${DB_NAME}" | gzip -9 > "${TEMP_FILE}"

mv "${TEMP_FILE}" "${FINAL_FILE}"

find "${BACKUP_DIR}" -type f -name '*.sql.gz' -mtime +7 -delete
