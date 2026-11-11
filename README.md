# FundConn

Decentralised event funding: a Solidity `EventFunding` contract (Hardhat), IPFS storage (Kubo) and a React + Vite frontend.

## Quick start

```bash
make build
make ipfs-config
```

App: http://localhost:3000. See [Local development](docs/local-development.md) and [Self-hosting](docs/self-hosting.md).

## Setup

If you are developing a production application, we recommend you to:

- Start the server by using command, docker-compose up -d in this directory
- Then run `make ipfs-config`:

> Journal

- [Unreleased Paper](preview/paper.pdf)

## Architecture

![server](preview/architecture.png)

## Preview

![image-1](preview/website.png)
![image-2](preview/website-2.png)
![image-3](preview/website-3.png)

## License

Licensed under the [Apache License 2.0](LICENSE). See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.
