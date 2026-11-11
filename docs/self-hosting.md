# Self-hosting

`docker-compose.yml` runs the whole stack with Docker.

| Service | Container ports | Host port |
|---|---|---|
| `ipfs` (kubo) | 4001, 5001, 8080 | 4001 (P2P), 5001 (API), 8080 (gateway) |
| `backend` (Hardhat node) | 8545 | 8545 |
| `frontend` (nginx) | 5000 | 3000 |

## Requirements

Users need a browser wallet extension (MetaMask or another `window.ethereum` provider) connected to your chain to create events or fund, because transactions are signed by the wallet. Without one the app is read-only via `VITE_NETWORK`, which must be reachable from users' browsers (the default `http://0.0.0.0:8545` baked into the image usually is not; rebuild with a public RPC URL).

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

## Demo deployment (projects exist by default)

For a demo, `docker compose up -d --build` is enough: the `backend` container starts the Hardhat node (listening on `0.0.0.0:8545`) and its entrypoint (`backend/docker-entrypoint.sh`) then runs `npm run deploy:dev`, which deploys the contract and seeds 10 sample projects (7 active, 3 expired, deadlines relative to the start time). The data is recreated on every container restart.

- On a fresh node the first deployment from the default account gets `0x5FbDB2315678afecb367f032d93F642f64180aa3`, which is the `VITE_CONTRACT_ADDRESS` baked into the frontend image, so the frontend works without extra steps.
- For a public demo, `VITE_NETWORK` must be a URL reachable from visitors' browsers (rebuild the frontend with it), and port 8545 must be exposed through your proxy. Visitors can browse projects without a wallet; donating requires a wallet on chain 31337 with a funded Hardhat test key (see [Local development](local-development.md#wallet-setup-metamask-coinbase-wallet-or-any-windowethereum-wallet)).
- The Hardhat test keys are public: this chain holds no real value and must never be used for real funds.
- Check the deploy in the logs: `docker compose logs backend`.

## Deploying on Dokploy

Use `docker-compose.dokploy.yml` (no host ports; Traefik routes by domain).

1. Create a **Compose** service from this repository and set the compose path to `./docker-compose.dokploy.yml`.
2. In the **Domains** tab add three HTTPS domains: `frontend` -> port `5000`, `backend` -> port `8545` (the RPC), `ipfs` -> port `8080` (the gateway).
3. In the **Environment** tab set `VITE_NETWORK=https://<backend domain>` and `VITE_IPFS=https://<ipfs domain>/ipfs`. They are build arguments, so redeploy (rebuild) the frontend after changing them. Use `https` for both: an https page cannot call an http RPC (mixed content).
4. Deploy. The backend entrypoint deploys the contract and seeds the 10 sample projects on every start; the frontend's default `VITE_CONTRACT_ADDRESS` matches the first deployment on a fresh node. Verify with the backend logs (`Contract deployed to: 0x...`) and update `VITE_CONTRACT_ADDRESS` if it differs.
5. Do not publish the IPFS API (5001); it is only on the internal network.

Wallet users add the backend domain as a custom network (RPC `https://<backend domain>`, chain ID `31337`).

## How backend and frontend pair

In Docker the `backend` service runs the Hardhat simulator (`npm run simulator`, port 8545). It is an in-memory chain: **restarting the container erases the contract and its data**, so redeploy afterwards (step 4) and rebuild the frontend with the new `VITE_CONTRACT_ADDRESS`. The frontend pairs with the backend only through `VITE_NETWORK` (RPC URL), `VITE_CONTRACT_ADDRESS` (deployed contract) and the ABI in `frontend/src/constant/EventFundingAbi.json`. See [Local development](local-development.md#how-the-pieces-fit-together) for details. For a persistent deployment, deploy to a public network (`npm run deploy:production`, Sepolia) instead of the simulator and point `VITE_NETWORK` at that RPC.

## Operations

- Data persists in the `ipfs_data` and `ipfs_staging` volumes.
- Logs: `docker compose logs -f <service>`. Stop: `docker compose down`.
- Exposing publicly: put a reverse proxy with TLS in front of port 3000, and do not expose 5001 (IPFS API) or 8545 to the internet.
