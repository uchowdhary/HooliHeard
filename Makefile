.PHONY: up down backend-install backend-dev frontend-install frontend-dev seed test

up:
	docker compose up -d

down:
	docker compose down

backend-install:
	cd backend && pip install -e ".[dev]"

backend-dev:
	cd backend && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

seed:
	python scripts/seed_db.py

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

test:
	cd backend && python -m pytest tests/ -v
