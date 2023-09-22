const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          const sendValue = ethers.parseEther("1");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.cheaperWithdraw();
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
