# Convenience wrapper around docker compose. Run `make help` for the list.
.DEFAULT_GOAL := help
COMPOSE := docker compose
BE := $(COMPOSE) run --rm --entrypoint "" backend

.PHONY: help up down build logs ps test lint format seed migrate makemigrations shell prod prod-down clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## Start the dev stack (hot reload) in the foreground
	$(COMPOSE) up --build

down: ## Stop and remove the dev stack
	$(COMPOSE) down

build: ## Rebuild images
	$(COMPOSE) build

logs: ## Tail logs
	$(COMPOSE) logs -f

ps: ## Show running services
	$(COMPOSE) ps

test: ## Run the backend test suite
	$(BE) pytest

lint: ## Lint backend (ruff) and frontend (eslint)
	$(BE) ruff check .
	cd frontend && npm run lint

format: ## Auto-format & fix the backend with ruff
	$(BE) ruff check --fix .
	$(BE) ruff format .

seed: ## (Re)seed demo content
	$(BE) python manage.py seed

migrate: ## Apply database migrations
	$(BE) python manage.py migrate

makemigrations: ## Generate new migrations
	$(COMPOSE) run --rm --no-deps --entrypoint "" backend python manage.py makemigrations

shell: ## Open a Django shell
	$(BE) python manage.py shell

prod: ## Start the production-like stack (nginx + gunicorn)
	$(COMPOSE) -f docker-compose.prod.yml up --build -d

prod-down: ## Stop the production-like stack
	$(COMPOSE) -f docker-compose.prod.yml down

clean: ## Stop everything and remove volumes (DESTROYS data)
	$(COMPOSE) down -v
