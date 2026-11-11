# Local development

The stack has three parts: an IPFS node (Kubo), a Hardhat blockchain simulator with the `EventFunding` contract (`backend/`), and a Vite + React frontend (`frontend/`).

## Prerequisites

- Node.js 20+ and npm (backend), pnpm (frontend, `pnpm-lock.yaml`)
- Docker with Compose
- A browser wallet extension (MetaMask) pointed at `http://localhost:8545` (chain id 31337); see [Wallet requirement](#wallet-requirement)

## Wallet requirement

A browser wallet extension (MetaMask or another `window.ethereum` provider) is **required** to use the app beyond read-only browsing. Transactions (creating events, funding) must be signed by a wallet; the app has no built-in signer. Without a wallet it falls back to a read-only `JsonRpcProvider` using `VITE_NETWORK`, and "Connect" asks you to install a browser wallet.

### Wallet setup (MetaMask, Coinbase Wallet or any `window.ethereum` wallet)

1. **Install one wallet extension only.** If two wallets are installed (for example MetaMask and Coinbase Wallet), they compete for `window.ethereum`; disable the one you do not want.
2. **Start the chain first** (`make simulator`) and deploy (`make deploy-dev`). Keep the terminal output: it lists the funded test accounts and their private keys.
3. **Add a custom network** in the wallet's network settings:
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency symbol: `ETH`

   Then select that network. If your wallet does not allow custom RPC networks, it cannot sign for the local node: use a wallet that does, or deploy to Sepolia (`npm run deploy:production`) and use that network instead.
4. **Import a funded account** (wallet menu -> Import account -> private key) using one of the keys printed by `make simulator` (each holds 10000 ETH on the local chain). A fresh wallet address has 0 ETH there and cannot pay gas. These keys are public test keys: never use them on a real network.
5. **Connect** to the site with the app's connect button and approve the request.
6. **After every simulator restart**: redeploy (`make deploy-dev`), update `VITE_CONTRACT_ADDRESS`, restart `pnpm dev`, and clear the wallet's cached activity/nonce for the account (MetaMask: Settings -> Advanced -> Clear activity tab data; or remove and re-add the network). Otherwise transactions fail with nonce errors.

If a transaction fails, the app shows a generic "Your provider refused the transaction" toast for any error. The real reason is in the browser console (for example `insufficient funds`, `nonce too low`, `user rejected action`, `missing revert data`). Check in order: wrong network, no gas balance, stale nonce, wrong `VITE_CONTRACT_ADDRESS`, or you closed the wallet popup.

For read-only mode, `VITE_NETWORK` must be reachable from the browser and the contract must be deployed at `VITE_CONTRACT_ADDRESS`.

## How the pieces fit together

```
Browser (frontend, :3000 / Vite dev)
   |  ethers.js: wallet (MetaMask) signs, or read-only JsonRpcProvider
   v
Hardhat node (backend simulator, :8545)  <-- EventFunding contract deployed here
   
Browser --> IPFS (Kubo): API :5001, gateway :8080 (VITE_IPFS)
```

### The Hardhat simulator

`make simulator` (`npm run simulator` in `backend/`) starts `hardhat node`: a local, in-memory Ethereum chain with JSON-RPC on `http://localhost:8545` and chain ID 31337. It prints 20 funded test accounts with their private keys (public, for development only). Blocks are mined instantly, so transactions confirm immediately and cost no real money.

Important behavior:

- **State is not persisted.** Stopping or restarting the node wipes the chain: the contract, all projects and all balances disappear.
- **Deployment is a separate step.** The node starts empty. `make deploy-dev` compiles `contracts/EventFunding.sol`, deploys it with the first test account, prints `Contract deployed to: 0x...` and seeds 5 sample projects (`backend/scripts/deploy.ts`).
- **The address is deterministic per deployer and nonce.** On a fresh node the first deployment from account #0 normally gets `0x5FbDB2315678afecb367f032d93F642f64180aa3`. If you deployed before, the address differs; always use the one printed.

### How backend and frontend are paired

The frontend knows nothing about the backend code directly. It connects through three pieces of configuration:

| Pairing | Backend side | Frontend side |
|---|---|---|
| Where the chain is | `hardhat node` on `:8545` | `VITE_NETWORK` (read-only RPC fallback); MetaMask network must point to the same RPC and chain ID 31337 |
| Which contract | address printed by `make deploy-dev` | `VITE_CONTRACT_ADDRESS` |
| How to call it | compiled contract ABI | `frontend/src/constant/EventFundingAbi.json` |

Rules of thumb:

1. After every simulator restart, run `make deploy-dev` again and update `VITE_CONTRACT_ADDRESS` in `frontend/.env`, then restart the Vite dev server (`.env` is read at startup).
2. If you change `EventFunding.sol` (functions, events, structs), recompile and copy the new ABI from `backend/artifacts` into `frontend/src/constant/EventFundingAbi.json`, otherwise calls fail or return wrong data.
3. `VITE_NETWORK` must be reachable from the **browser**, not just from your machine's containers.
4. The project list is read via `getProjects()` on the contract at `VITE_CONTRACT_ADDRESS`. An empty list means the address has no contract (check the address or redeploy) or nothing was seeded.

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

- **Project list is empty**: `VITE_CONTRACT_ADDRESS` points to an address with no contract (for example a wallet address, or the node was restarted). Run `make deploy-dev`, update `frontend/.env`, restart `pnpm dev`.
- **Wrong contract address / calls revert**: the simulator was restarted; redeploy and update `VITE_CONTRACT_ADDRESS`.
- **"Your provider refused the transaction" toast**: generic error for any failed transaction; see [Wallet setup](#wallet-setup-metamask-coinbase-wallet-or-any-windowethereum-wallet) and check the browser console for the real reason.
- **Transaction refused with `nonce too low` (stale nonce)**: the simulator was restarted or redeployed, so the wallet's cached nonce no longer matches the node. Fix it with either:
  - In Coinbase Wallet, remove the Hardhat network and add it again, then reload the page. Check Settings for a "reset account" or "clear activity" option; not every wallet version has one.
  - Import a different Hardhat account (for example #1, `0x7099…79C8`) and donate from it. A fresh account has no cached nonce, so nothing is stale. This also avoids donating from account #0: it owns every seeded project, so donating from it just sends ETH back to itself.
- **IPFS requests blocked by CORS**: rerun `make ipfs-config`.
- **Port already in use**: stop other services on 3000, 4001, 5001, 8080 or 8545.
