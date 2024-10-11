const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FundMe", function () {
  async function deployFundMeFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const FundMe = await ethers.getContractFactory("FundMe");
    const fundMe = await FundMe.deploy();
    
    return { fundMe, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { fundMe, owner } = await loadFixture(deployFundMeFixture);
      expect(await fundMe.getOwner()).to.equal(owner.address);
    });
  });

  describe("Funding", function () {
    it("Should transfer correct amount of funds to contract", async function () {
      const { fundMe, addr1 } = await loadFixture(deployFundMeFixture);
      const fundAmount = ethers.parseEther("1"); // 1 ETH
      
      await expect(fundMe.connect(addr1).fund({ value: fundAmount }))
        .to.changeEtherBalance(fundMe, fundAmount);
        
      expect(await fundMe.getFunderBalance(addr1.address)).to.equal(fundAmount);
    });

    it("Should fail if sent amount is less than 10 Gwei", async function () {
      const { fundMe, addr1 } = await loadFixture(deployFundMeFixture);
      const fundAmount = ethers.parseUnits("9", "gwei"); // 9 Gwei
      
      await expect(
        fundMe.connect(addr1).fund({ value: fundAmount })
      ).to.be.revertedWith("Minimum funding amount is 10 gwei");
    });
  });

  describe("Withdrawing", function () {
    it("Should allow owner to withdraw full funds", async function () {
      const { fundMe, owner, addr1 } = await loadFixture(deployFundMeFixture);
      const fundAmount = ethers.parseEther("1");
      
      await fundMe.connect(addr1).fund({ value: fundAmount });
      
      await expect(fundMe.connect(owner).withdraw())
        .to.changeEtherBalances(
          [fundMe, owner],
          [ethers.parseEther("-1"), fundAmount]
        );
        
      expect(await fundMe.getFunderBalance(addr1.address)).to.equal(0);
    });

    it("Should allow owner to withdraw funds to a distinct address", async function () {
      const { fundMe, owner, addr1, addr2 } = await loadFixture(deployFundMeFixture);
      const fundAmount = ethers.parseEther("1");
      const withdrawAmount = ethers.parseEther("0.5");
      
      await fundMe.connect(addr1).fund({ value: fundAmount });
      
      await expect(fundMe.connect(owner).withdrawToDistinctAddress(addr2.address, withdrawAmount))
        .to.changeEtherBalances(
          [fundMe, addr2],
          [ethers.parseEther("-0.5"), withdrawAmount]
        );
        
      expect(await fundMe.getFunderBalance(addr1.address)).to.equal(withdrawAmount);
    });

    it("Should fail if non-owner tries to withdraw", async function () {
      const { fundMe, addr1, addr2 } = await loadFixture(deployFundMeFixture);
      const fundAmount = ethers.parseEther("1");
      
      await fundMe.connect(addr1).fund({ value: fundAmount });
      
      await expect(
        fundMe.connect(addr2).withdraw()
      ).to.be.revertedWith("Only owner can call this function");
      
      await expect(
        fundMe.connect(addr2).withdrawToDistinctAddress(addr2.address, fundAmount)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });
});

// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("FundMe", function () {
//     let fundMe, owner, addr1, addr2, addr3;

//     // Helper function to deploy the contract
//     beforeEach(async function () {
//         [owner, addr1, addr2, addr3] = await ethers.getSigners();
//         const FundMe = await ethers.getContractFactory("FundMe");
//         fundMe = await FundMe.deploy();  // Deploy the contract
//     });

//     // 1. Test if the contract owner is equal to the contract deployer.
//     it("Contract owner is equal to the contract deployer", async function () {
//         expect(await fundMe.getOwner()).to.equal(owner.address);
//     });

//     // 2. Test if the correct amount of funds is transferred to the contract.
//     it("Funds are transferred to the contract", async function () {
//         const tx = await addr1.sendTransaction({
//             to: fundMe.address,                   // Send to contract address
//             value: ethers.parseUnits("15", "gwei") // 15 Gwei
//         });
//         await tx.wait(); // Wait for the transaction to be mined

//         expect(await fundMe.getContractBalance()).to.equal(ethers.parseUnits("15", "gwei"));
//     });

//     // 3. Test that a transaction fails if ETH sent is less than 10 Gwei.
//     it("Transaction fails if ETH sent is less than 10 Gwei", async function () {
//         await expect(
//             addr1.sendTransaction({
//                 to: fundMe.address,                   // Send to contract address
//                 value: ethers.parseUnits("1", "gwei") // 1 Gwei (too low)
//             })
//         ).to.be.revertedWith("Minimum amount is 10 Gwei");
//     });

//     // 4. Test if the owner can withdraw full funds from the contract.
//     it("Owner can withdraw full funds from the contract", async function () {
//         await addr1.sendTransaction({
//             to: fundMe.address,                   // Send to contract address
//             value: ethers.parseUnits("15", "gwei") // 15 Gwei
//         });

//         const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
//         const tx = await fundMe.withdraw();       // Owner withdraws funds
//         const receipt = await tx.wait();          // Wait for the transaction

//         const gasUsed = receipt.gasUsed.mul(tx.gasPrice); // Gas cost
//         const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

//         // The owner balance should be approximately the original + 15 Gwei - gas cost
//         expect(finalOwnerBalance).to.be.closeTo(initialOwnerBalance.add(ethers.parseUnits("15", "gwei")), gasUsed);
//         expect(await fundMe.getContractBalance()).to.equal(0);
//     });

//     // 5. Test if the owner can withdraw funds to a distinct address.
//     it("Owner can withdraw funds to a distinct address", async function () {
//         await addr1.sendTransaction({
//             to: fundMe.address,                   // Send to contract address
//             value: ethers.parseUnits("20", "gwei") // 20 Gwei
//         });

//         const initialAddr2Balance = await ethers.provider.getBalance(addr2.address);
//         await fundMe.withdrawToDistinctAddress(addr2.address, ethers.parseUnits("10", "gwei"));
//         const finalAddr2Balance = await ethers.provider.getBalance(addr2.address);

//         expect(finalAddr2Balance.sub(initialAddr2Balance)).to.equal(ethers.parseUnits("10", "gwei"));
//         expect(await fundMe.getContractBalance()).to.equal(ethers.parseUnits("10", "gwei")); // Should have 10 Gwei left
//     });

//     // 6. Test if a failed withdrawal attempt happens for the wrong owner.
//     it("Withdrawal attempt fails for non-owner", async function () {
//         await expect(fundMe.connect(addr1).withdraw()).to.be.revertedWith("Not the owner");
//     });
// });




// // error with "fundMe.deployed() function. most probably decrepatated"
// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("FundMe", function () {

//     let fundMe, owner, addr1, addr2, addr3;
    
//     // Helper function to deploy the contract
//     beforeEach(async function () {
//         [owner, addr1, addr2, addr3] = await ethers.getSigners();
//         const FundMe = await ethers.getContractFactory("FundMe");
//         fundMe = await FundMe.deploy();
//         await fundMe.deployed();
//     });

//     // 1. Test if the contract owner is equal to the contract deployer.
//     it("Contract owner is equal to the contract deployer", async function () {
//         expect(await fundMe.getOwner()).to.equal(owner.address);
//     });

//     // 2. Test if the correct amount of funds is transferred to the contract.
//     it("Funds are transferred to the contract", async function () {
//         await addr1.sendTransaction({ to: fundMe.address, value: ethers.parseUnits("15", "gwei") });
//         expect(await fundMe.getContractBalance()).to.equal(ethers.parseUnits("15", "gwei"));
//     });

//     // 3. Test that a transaction fails if ETH sent is less than 10 Gwei.
//     it("Transaction fails if ETH sent is less than 10 Gwei", async function () {
//         await expect(addr1.sendTransaction({ to: fundMe.address, value: ethers.parseUnits("1", "gwei") }))
//             .to.be.revertedWith("Minimum amount is 10 Gwei");
//     });

//     // 4. Test if the owner can withdraw full funds from the contract.
//     it("Owner can withdraw full funds from the contract", async function () {
//         await addr1.sendTransaction({ to: fundMe.address, value: ethers.parseUnits("15", "gwei") });
//         const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
        
//         const tx = await fundMe.withdraw();
//         const receipt = await tx.wait();
//         const gasUsed = receipt.gasUsed.mul(tx.gasPrice);
        
//         const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
        
//         expect(finalOwnerBalance).to.be.closeTo(initialOwnerBalance.add(ethers.parseUnits("15", "gwei")), gasUsed);
//         expect(await fundMe.getContractBalance()).to.equal(0);
//     });

//     // 5. Test if the owner can withdraw funds to a distinct address.
//     it("Owner can withdraw funds to a distinct address", async function () {
//         await addr1.sendTransaction({ to: fundMe.address, value: ethers.parseUnits("20", "gwei") });
//         const initialAddr2Balance = await ethers.provider.getBalance(addr2.address);
        
//         await fundMe.withdrawToDistinctAddress(addr2.address, ethers.parseUnits("10", "gwei"));
//         const finalAddr2Balance = await ethers.provider.getBalance(addr2.address);
        
//         expect(finalAddr2Balance.sub(initialAddr2Balance)).to.equal(ethers.parseUnits("10", "gwei"));
//         expect(await fundMe.getContractBalance()).to.equal(ethers.parseUnits("10", "gwei"));
//     });

//     // 6. Test if a failed withdrawal attempt happens for the wrong owner.
//     it("Withdrawal attempt fails for non-owner", async function () {
//         await expect(fundMe.connect(addr1).withdraw()).to.be.revertedWith("Not the owner");
//     });
// });

