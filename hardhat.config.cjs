// require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    // We will deploy to this one running in a separate terminal
    localhost: {
      url: "http://127.0.0.1:8545",
    }
  }
};
