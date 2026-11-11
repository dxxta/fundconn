import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  paths: {
    artifacts: "./artifacts",
  },
  networks: {
    // localhost: {
    //   // url set default to simulator, localhost:8545
    //   chainId: 31337,
    // },
    ...(process.env.PROVIDER && process.env.PRIVATE_KEY
      ? {
          sepolia: {
            url: process.env.PROVIDER,
            accounts: [`0x${process.env.PRIVATE_KEY}`],
          },
        }
      : {}),
  },
};

export default config;
