# GH Dashboard - Makefile (Docker dev only)

SHELL := /bin/bash
.DEFAULT_GOAL := help

ROOT_DIR     := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
DOCKER_DIR   := $(ROOT_DIR)/.docker
ENV_FILE     ?= $(ROOT_DIR)/.env
COMPOSE_DEV  := docker compose --env-file $(ENV_FILE) -f $(DOCKER_DIR)/docker-compose.dev.yml

.PHONY: help env init dev dev-d down restart logs ps migrate seed shell-backend shell-dashboard shell-db clean health

help: ## Show available commands
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

env: ## Create .env from Docker template
	@if [ ! -f "$(ENV_FILE)" ]; then \
		cp "$(DOCKER_DIR)/env/docker.env.example" "$(ENV_FILE)"; \
		echo "Created $(ENV_FILE)"; \
	else \
		echo "$(ENV_FILE) already exists"; \
	fi

init: env ## Prepare env file for Docker

dev: init ## Start development stack (hot reload)
	$(COMPOSE_DEV) up --build

dev-d: init ## Start development stack detached
	$(COMPOSE_DEV) up --build -d

down: ## Stop development stack
	$(COMPOSE_DEV) down

restart: down dev-d ## Restart development stack

logs: ## Follow container logs
	$(COMPOSE_DEV) logs -f

ps: ## Show running containers
	$(COMPOSE_DEV) ps

migrate: ## Run Prisma migrations in backend container
	$(COMPOSE_DEV) exec backend sh -c 'cd /app && pnpm db:migrate:deploy'

seed: ## Seed database in backend container
	$(COMPOSE_DEV) exec backend sh -c 'cd /app && pnpm db:seed'

shell-backend: ## Open shell in backend container
	$(COMPOSE_DEV) exec backend sh

shell-dashboard: ## Open shell in dashboard container
	$(COMPOSE_DEV) exec dashboard sh

shell-db: ## Open psql in database container
	$(COMPOSE_DEV) exec db psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-gh_blog}

health: ## Check API health endpoint
	@curl -sf http://localhost:$${API_PORT:-4000}/health | cat || echo "API not reachable"

clean: ## Stop stack and remove volumes
	$(COMPOSE_DEV) down -v --remove-orphans
