# FundMe Hardhat Smart-Contract Project using Solidity

This repository contains a Solidity smart contract named `FundMe` along with associated tests. The `FundMe` contract allows users to send ETH to the contract, and only the owner can withdraw the funds. Additionally, the owner can withdraw specific amounts to distinct addresses. The project also includes test cases written using Hardhat to ensure the contract behaves as expected.

## Project Structure

- **contracts/FundMe.sol**: The Solidity contract that implements the funding logic.
- **test/FundMe.js**: The JavaScript test file that contains unit tests for the smart contract.

## Prerequisites

To run this project, ensure you have the following installed:
- Node.js (v20.x) - [Download Node.js](https://nodejs.org/en/download/package-manager)
- Hardhat - A development environment to compile, deploy, test, and debug Ethereum software.

## Setup Instructions

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Phaneesh-Katti/Solidity.git
    cd Solidity
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Compile the smart contract**:
    ```bash
    npx hardhat compile
    ```

4. **Run the tests**:
    ```bash
    npx hardhat test
    ```

## Usage

- **Funding the contract**: Users can fund the contract with more than 10 Gwei using the `fund` function.
- **Withdrawing funds**: Only the contract owner can withdraw funds. The owner can withdraw the entire balance or withdraw to a specific address.

## Deployment

1. **Start a local node**:
    ```bash
    npx hardhat node
    ```

2. **Deploy the contract to the local node**:
    ```bash
    npx hardhat ignition deploy ./ignition/modules/FundMe.js --network localhost
    ```

## Test Cases Overview

The project includes unit tests to verify contract behavior. These tests include:
1. Verifying that the contract owner is the deployer.
2. Ensuring correct amounts of funds are transferred.
3. Checking that transactions fail when less than 10 Gwei is sent.
4. Testing the owner’s ability to withdraw all funds or withdraw specific amounts to another address.
5. Verifying that non-owners cannot withdraw funds.

## References

- [Hardhat Documentation](https://hardhat.org/hardhat-runner/docs/getting-started)
- [Solidity by Example](https://solidity-by-example.org/)

