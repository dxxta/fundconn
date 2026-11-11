# Local development

The stack has three parts: an IPFS node (Kubo), a Hardhat blockchain simulator with the `EventFunding` contract (`backend/`), and a Vite + React frontend (`frontend/`).

## Prerequisites

- Node.js 20+ and npm (backend), pnpm (frontend, `pnpm-lock.yaml`)
- Docker with Compose
- A wallet extension (e.g. MetaMask) pointed at `http://localhost:8545` (chain id 31337)

## 1. Start IPFS

```bash
docker compose up -d ipfs
make ipfs-config   # sets CORS headers on the Kubo API and restarts the container
```

Ports: `4001` (P2P), `5001` (API), `8080` (gateway). `make ipfs-config` expects the container name `ipfs_host`.

## 2. Start the local chain and deploy the contract

```bash
cd backend
npm install
npm run simulator      # hardhat node on :8545
# in another terminal
npm run deploy:dev     # compile + deploy scripts/deploy.ts to localhost
```

The first deployment from the default Hardhat account normally yields `0x5FbDB2315678afecb367f032d93F642f64180aa3`, the address baked into the frontend Dockerfile. Use the address printed by the deploy script if it differs. `npm run clean` resets Hardhat artifacts.

## 3. Run the frontend

```bash
cd frontend
pnpm install
```

Create `frontend/.env.local`:

```
VITE_CONTRACT_ADDRESS=<deployed contract address>
VITE_NETWORK=http://localhost:8545
VITE_IPFS=<IPFS API/gateway URL, e.g. http://localhost:5001>
```

Then `pnpm dev`. Other scripts: `pnpm build`, `pnpm lint`, `pnpm preview`.

## Troubleshooting

- **Wrong contract address / calls revert**: the simulator was restarted; redeploy and update `VITE_CONTRACT_ADDRESS`.
- **IPFS requests blocked by CORS**: rerun `make ipfs-config`.
- **Port already in use**: stop other services on 3000, 4001, 5001, 8080 or 8545.
