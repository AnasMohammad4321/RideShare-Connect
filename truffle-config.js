module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Ensure this matches the Ganache or local blockchain port
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Ensure this matches the Solidity version in your contracts
    },
  },
  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts'
};
