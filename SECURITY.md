# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Report them privately through GitHub's
[private vulnerability reporting](https://github.com/dxxta/Blockchain-Web3-Ethereum-Crowdfunding/security/advisories/new)
for this repository. Include a description, reproduction steps and the affected component
(smart contract, backend, frontend or IPFS setup).

You can expect an acknowledgement within a few days. Fixes are coordinated with the reporter before public disclosure.

## Scope and notes

- The `EventFunding` contract has not been independently audited. Do not use it with real funds without your own review.
- Never commit `backend/.env`. It holds `PRIVATE_KEY`, `CONTRACT_ADDRESS` and `PROVIDER`; use a dedicated key with no real funds for testing.
- Do not expose the IPFS API (port 5001) or the Hardhat node (port 8545) to the public internet. `make ipfs-config` allows any origin on the IPFS API, which is intended for local development only.
