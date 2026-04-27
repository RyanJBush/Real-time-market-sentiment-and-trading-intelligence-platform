.PHONY: up down backend-dev frontend-dev lint test test-backend build-frontend ci-local demo-seed format

up:
	docker compose up --build

down:
	docker compose down -v

backend-dev:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend-dev:
	cd frontend && npm install && npm run dev

lint:
	cd frontend && npm install && npm run lint

test-backend:
	cd backend && pip install -r requirements.txt && NLP_PROVIDER=heuristic PYTHONPATH=. pytest -q

test:
	$(MAKE) test-backend

build-frontend:
	cd frontend && npm install && npm run build

ci-local:
	$(MAKE) test-backend
	$(MAKE) lint
	$(MAKE) build-frontend

demo-seed:
	cd backend && pip install -r requirements.txt && NLP_PROVIDER=heuristic PYTHONPATH=. python scripts/seed_demo.py

format:
	@echo "Add formatters (ruff/prettier) as project evolves"
