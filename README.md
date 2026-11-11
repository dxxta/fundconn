# FundConn

![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?style=flat-square&logo=hardhat&logoColor=black)
![Ethers.js](https://img.shields.io/badge/Ethers.js-2535A0?style=flat-square&logo=ethers&logoColor=white)
![IPFS](https://img.shields.io/badge/IPFS_(Kubo)-65C2CB?style=flat-square&logo=ipfs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Mantine](https://img.shields.io/badge/Mantine-339AF0?style=flat-square&logo=mantine&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square&logo=opensourceinitiative&logoColor=white)

Decentralised event funding: a Solidity `EventFunding` contract (Hardhat), IPFS storage (Kubo) and a React + Vite frontend.

## Quick start

```bash
make build
make ipfs-config
```

App: http://localhost:3000. A browser wallet (MetaMask) is required to sign transactions; without one the app is read-only. See [Local development](docs/local-development.md), [Self-hosting](docs/self-hosting.md) and [Demo deployment](docs/demo.md).

## Setup

If you are developing a production application, we recommend you to:

- Start the server by using command, docker-compose up -d in this directory
- Then run `make ipfs-config`:

> Journal

- [Unreleased Paper](preview/paper.pdf)

## Architecture

![server](preview/architecture.png)

## Preview

![image-1](docs/demos/website.png)
![image-2](docs/demos/website-2.png)
![image-3](docs/demos/website-3.png)

## License

Licensed under the [MIT License](LICENSE). See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
