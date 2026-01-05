const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DealRegistryModule", (m) => {
  const dealRegistry = m.contract("DealRegistry");

  return { dealRegistry };
});
