# Online Flight Booking System

Monorepo layout for the flight booking project.

## Project Structure

```text
.
├── backend/                 # Python REST API, MySQL schema, seed data, tests
│   ├── controllers/
│   ├── core/
│   ├── database/
│   ├── repositories/
│   ├── services/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/                # Frontend app workspace
│   ├── src/
│   ├── index.html
│   └── package.json
├── BACKEND_API_REFERENCE.md # Backend API functions and endpoint reference
├── flight-booking-api.postman_collection.json # Postman collection for API testing
├── docker-compose.yml       # Production UI, API, MySQL and Flyway stack
├── deployment/              # Deploy, TLS certificate and backup scripts
└── start.sh                 # Starts the backend API
```

## API Documentation

- `BACKEND_API_REFERENCE.md`: backend API feature and endpoint reference.
- `flight-booking-api.postman_collection.json`: Postman collection for importing and testing backend APIs.

## Run Backend

```bash
./start.sh
```

The API runs at:

```text
http://localhost:8000/api/v1
```

## Run Frontend Shell

```bash
cd frontend
npm run dev
```

The repository includes two committed, non-secret frontend configurations:

- `frontend/.env.localdev`: local backend at `http://localhost:8000/api/v1`.
- `frontend/.env.proddev`: production backend at `https://uitair.donotaccess.com/api/v1`.

Run the local UI against the local backend:

```bash
cd frontend
npm run dev:local
```

Run the local UI against the production backend and database:

```bash
cd frontend
npm run dev:prod
```

Do not point a local backend at the production database. Local backend startup
uses `docker-compose.dev.yml`, MySQL port `3308`, and a separate
`flight-mysql-dev-data` volume.

If port `3308` is occupied, choose another local-only port:

```bash
MYSQL_DEV_PORT=13308 ./start.sh
```

On Windows, backend profiles can be started without `start.sh`:

```powershell
# Local backend and local MySQL
.\start-backend-local.ps1

# Local backend connected to production MySQL
.\start-backend-prod.ps1
```

The corresponding committed backend profiles are `backend/config.local.ini`
and `backend/config.prod.ini`. Select one manually with `APP_CONFIG_FILE`.

The frontend shell is intentionally lightweight. It gives the UI team a separate workspace without mixing frontend code into the Python backend.

## Backend Commands

```bash
cd backend
python3 -m database.seed
python3 main.py
```

From the repository root, tests can be run with:

```bash
python3 -m unittest discover -s backend/tests -t backend
```

## Production deployment

Production is served at `https://uitair.donotaccess.com`. The same origin
proxies `/api/v1` to the backend. MySQL is available to developers at
`mysql.uitair.donotaccess.com:3306` using username and password authentication.

The production server keeps secrets outside the Git checkout in
`/opt/flight-reservation/shared/.env`. Start from `deployment/.env.example`.
Never commit that file or the generated private keys.

Deployments are triggered by pushes to `main` through
`.github/workflows/deploy.yml`. The server checks out the exact commit, builds
tagged images, runs Flyway, checks application health and rolls back containers
to the last successful tag on failure.

Run the demo seed only once after the first successful deployment:

```bash
cd /opt/flight-reservation/repo
IMAGE_TAG="$(cat /opt/flight-reservation/state/last-successful-sha)" \
  docker compose --env-file /opt/flight-reservation/shared/.env \
  --profile seed run --rm seed
```

### MySQL client

```bash
mysql --host=mysql.uitair.donotaccess.com --port=3306 \
  --user=flight_dev --password --ssl-mode=DISABLED \
  --get-server-public-key flight_booking
```

Port `3306` is intentionally Internet-accessible without mandatory TLS. Network
traffic and credentials are not protected from interception; use the restricted
`flight_dev` account and rotate its password if exposure is suspected.
