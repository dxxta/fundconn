# Self-hosting

`docker-compose.yml` runs the whole stack with Docker.

| Service | Container ports | Host port |
|---|---|---|
| `ipfs` (kubo) | 4001, 5001, 8080 | 4001 (P2P), 5001 (API), 8080 (gateway) |
| `backend` (Hardhat node) | 8545 | 8545 |
| `frontend` (nginx) | 5000 | 3000 |

## Steps

1. Create `backend/.env` (never commit it):
   ```
   PRIVATE_KEY=<deployer key, without 0x prefix>
   CONTRACT_ADDRESS=<deployed contract address>
   PROVIDER=<RPC URL, used for the sepolia network>
   ```
2. Start everything: `make build` (or `docker compose up -d`).
3. Configure IPFS CORS: `make ipfs-config` (it sets `API.HTTPHeaders` and restarts `ipfs_host`).
4. Deploy the contract to the container's chain, from `backend/`: `npm run deploy:dev` (localhost) or `npm run deploy:production` (Sepolia, needs `PROVIDER` and `PRIVATE_KEY`).
5. Open the app at `http://localhost:3000`.

## Frontend configuration

The frontend image bakes in `VITE_CONTRACT_ADDRESS` and `VITE_NETWORK` at build time (see `frontend/Dockerfile`). If your contract address or RPC URL differs, edit those values and rebuild: `docker compose build frontend && docker compose up -d frontend`. `VITE_IPFS` is also read by the app.

## Operations

- Data persists in the `ipfs_data` and `ipfs_staging` volumes.
- Logs: `docker compose logs -f <service>`. Stop: `docker compose down`.
- Exposing publicly: put a reverse proxy with TLS in front of port 3000, and do not expose 5001 (IPFS API) or 8545 to the internet.
