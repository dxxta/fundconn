#!/bin/sh
# Demo entrypoint: start the in-memory Hardhat node, then deploy + seed the
# sample projects so the data exists by default after every (re)start.
set -e

npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "Waiting for the Hardhat node..."
until node -e 'fetch("http://127.0.0.1:8545",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_chainId",params:[]})}).then(()=>process.exit(0)).catch(()=>process.exit(1))'; do
  sleep 1
done

npm run deploy:dev

wait $NODE_PID
