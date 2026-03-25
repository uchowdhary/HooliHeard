.PHONY: up down seed backend-install backend-dev frontend-install frontend-dev test

# --- Docker (recommended for others) ---

up:
	docker compose up -d --build

down:
	docker compose down

seed:
	docker compose run --rm seed

# Full setup: start everything + seed data
setup: up
	@echo "Waiting for services to start..."
	sleep 3
	docker compose run --rm seed
	@echo ""
	@echo "Ready! Open http://localhost:5173"

# --- Local development ---

backend-install:
	cd backend && pip3 install -e ".[dev]"

backend-dev:
	cd backend && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

test:
	cd backend && python3 -m pytest tests/ -v
