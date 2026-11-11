IPFS_CONTAINER ?= ipfs_host
IPFS_CORS := {"Access-Control-Allow-Headers": ["X-Requested-With","Range"],"Access-Control-Allow-Methods": ["POST","GET"],"Access-Control-Allow-Origin": ["*"]}

.PHONY: help build up down logs ipfs-config simulator deploy-dev

help: ## List targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*##/\t/'

build: ## Build and start all services (was build.sh)
	docker compose up -d

up: build

down: ## Stop all services
	docker compose down

logs: ## Follow service logs
	docker compose logs -f

ipfs-config: ## Set Kubo API CORS headers and restart (was start.sh)
	docker exec $(IPFS_CONTAINER) ipfs config --json API.HTTPHeaders '$(IPFS_CORS)'
	docker restart $(IPFS_CONTAINER)
	docker exec $(IPFS_CONTAINER) ipfs config show

simulator: ## Run the Hardhat node locally
	cd backend && npm run simulator

deploy-dev: ## Compile and deploy the contract to localhost
	cd backend && npm run deploy:dev
