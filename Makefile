# Blogy - Makefile (Docker dev)

SHELL := /bin/bash
.DEFAULT_GOAL := help

ROOT_DIR  := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
ENV_FILE  ?= $(ROOT_DIR)/.env
COMPOSE   := docker compose --env-file $(ENV_FILE)

.PHONY: help env init dev dev-d dev-db down restart logs ps migrate seed db-refresh install shell-backend shell-dashboard shell-client shell-db clean health rebuild

help: ## Show available commands
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

env: ## Create .env from template
	@if [ ! -f "$(ENV_FILE)" ]; then \
		cp "$(ROOT_DIR)/.env.example" "$(ENV_FILE)"; \
		echo "Created $(ENV_FILE)"; \
	else \
		echo "$(ENV_FILE) already exists"; \
	fi

init: env ## Prepare .env for Docker / local dev

dev: init ## Start full dev stack (hot reload)
	$(COMPOSE) up --build

dev-d: init ## Start dev stack detached
	$(COMPOSE) up --build -d

dev-db: init ## Start PostgreSQL only (for local pnpm dev)
	$(COMPOSE) up db -d

down: ## Stop all containers
	$(COMPOSE) down

restart: down dev-d ## Restart dev stack

logs: ## Follow container logs
	$(COMPOSE) logs -f

ps: ## Show container status
	$(COMPOSE) ps

install: ## Install deps inside app containers
	$(COMPOSE) exec backend sh -c 'cd /app && pnpm install --frozen-lockfile'
	$(COMPOSE) exec dashboard sh -c 'cd /app && pnpm install --frozen-lockfile'
	$(COMPOSE) exec client sh -c 'cd /app && pnpm install --frozen-lockfile'

migrate: ## Run Prisma migrations in backend container
	$(COMPOSE) exec backend sh -c 'cd /app && pnpm db:migrate:deploy'

seed: ## Seed database in backend container
	$(COMPOSE) exec backend sh -c 'cd /app && pnpm db:seed'

db-refresh: ## Reset database (drop, migrate, seed)
	$(COMPOSE) exec backend sh -c 'cd /app && pnpm db:reset'

shell-backend: ## Shell in backend container
	$(COMPOSE) exec backend sh

shell-dashboard: ## Shell in dashboard container
	$(COMPOSE) exec dashboard sh

shell-client: ## Shell in client container
	$(COMPOSE) exec client sh

shell-db: ## psql in database container
	$(COMPOSE) exec db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-blogy}

health: ## Check API health endpoint
	@curl -sf http://localhost:$${API_PORT:-4000}/health | cat || echo "API not reachable"

rebuild: ## Rebuild images without cache
	$(COMPOSE) build --no-cache

clean: ## Stop stack and remove volumes
	$(COMPOSE) down -v --remove-orphans
