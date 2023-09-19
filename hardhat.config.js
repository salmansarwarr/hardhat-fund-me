require("hardhat-gas-reporter")
require('@nomicfoundation/hardhat-toolbox')
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy");  
require("@nomiclabs/hardhat-ethers")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 3,
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKET_API_KEY || "",
    },
};
