#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/opt/flight-reservation}"
REPO_DIR="${APP_ROOT}/repo"
SHARED_DIR="${APP_ROOT}/shared"
STATE_DIR="${APP_ROOT}/state"
ENV_FILE="${SHARED_DIR}/.env"
LOCK_FILE="${STATE_DIR}/deploy.lock"
TARGET_SHA="${1:?usage: deploy.sh <git-sha>}"

mkdir -p "${STATE_DIR}"
exec 9>"${LOCK_FILE}"
flock -n 9 || { echo "Another deployment is running." >&2; exit 1; }

cd "${REPO_DIR}"
git fetch --prune origin main
git cat-file -e "${TARGET_SHA}^{commit}"

PREVIOUS_SHA=""
if [[ -f "${STATE_DIR}/last-successful-sha" ]]; then
  PREVIOUS_SHA="$(cat "${STATE_DIR}/last-successful-sha")"
fi

rollback() {
  local exit_code=$?
  if [[ -n "${PREVIOUS_SHA}" ]]; then
    echo "Deployment failed; rolling back to ${PREVIOUS_SHA}."
    git checkout --force "${PREVIOUS_SHA}"
    IMAGE_TAG="${PREVIOUS_SHA}" docker compose --env-file "${ENV_FILE}" up -d --no-build mysql backend frontend || true
  fi
  exit "${exit_code}"
}
trap rollback ERR

git checkout --force "${TARGET_SHA}"
export IMAGE_TAG="${TARGET_SHA}"

docker compose --env-file "${ENV_FILE}" --profile tools build backend frontend flyway
docker compose --env-file "${ENV_FILE}" up -d mysql
docker compose --env-file "${ENV_FILE}" --profile tools run --rm flyway
docker compose --env-file "${ENV_FILE}" up -d --no-build backend frontend

for attempt in $(seq 1 20); do
  if docker compose --env-file "${ENV_FILE}" exec -T frontend wget -qO- http://127.0.0.1/api/v1/health | grep -q '"status": "ok"\|"status":"ok"'; then
    break
  fi
  if [[ "${attempt}" == "20" ]]; then
    echo "Application health check failed." >&2
    exit 1
  fi
  sleep 5
done

printf '%s' "${TARGET_SHA}" > "${STATE_DIR}/last-successful-sha"
trap - ERR

docker builder prune -f --filter 'until=168h' || true
docker image prune -f --filter 'until=168h' || true
echo "Deployment ${TARGET_SHA} completed successfully."
