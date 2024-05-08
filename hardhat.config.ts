import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings:{
      optimizer:{
        enabled: true,
        runs: 100,
      },
      viaIR: true,
    }
  },
   networks: {
     local: {
       chainId: 31337,
       url: "http:127.0.0.1:8545/",
       accounts: {
         mnemonic: "test test test test test test test test test test test junk"
       }
     }
   },
  //  networks: {
  //     bsctest: {
  //       url: "https://ethereum-sepolia-rpc.publicnode.com",
  //       chainId: 11155111,
  //       accounts: {
  //         mnemonic: process.env.SECRET
  //       }
  //     },
  //   },
  //   etherscan: {
  //     apiKey: process.env.API_KEY
  //   }
};

export default config;