const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FundMeDeployer", (m) => {
    const fundMe = m.contract("FundMe");

    return { fundMe };
});