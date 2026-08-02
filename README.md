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
├── docker-compose.yml       # MySQL and Flyway
├── start.sh                 # Starts the backend API
└── flight-booking-api.postman_collection.json
```

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
