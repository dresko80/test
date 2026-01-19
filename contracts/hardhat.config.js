require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    arcTestnet: {
      url: process.env.ARC_RPC || "https://rpc.testnet.arc.network",
      chainId: 77777,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
