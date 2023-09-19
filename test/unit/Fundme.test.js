const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");
// const chai = require("chai")
// const { solidity } = require("ethereum-waffle")
// chai.use(solidity)

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    const sendValue = ethers.parseEther("1");

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("constructor", async () => {
        it("Sets the aggregator addresses correctly", async () => {
            const res = await fundMe.getPriceFeed();

            assert.equal(res, mockV3Aggregator.target);
        });
    });

    describe("fund", async () => {
        it("Fails if you don't send enough eth", async () => {
            await expect(fundMe.fund()).to.be.reverted;
        });

        it("updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of s_funders", async () => {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.getFunder(0);
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue });
        });

        it("can withdraw eth from a single founder", async () => {
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasPrice * gasUsed;

            const endingFundMeBakance = await ethers.provider.getBalance(
                fundMe.target
            );
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBakance, 0);
            assert.equal(
                (endingDeployerBalance + gasCost).toString(),
                (startingDeployerBalance + startingFundMeBalance).toString()
            );
        });

        it("cheaper withdraw from a single founder", async () => {
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasPrice * gasUsed;

            const endingFundMeBakance = await ethers.provider.getBalance(
                fundMe.target
            );
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBakance, 0);
            assert.equal(
                (endingDeployerBalance + gasCost).toString(),
                (startingDeployerBalance + startingFundMeBalance).toString()
            );
        });

        it("allows us to wirhdraw with multiple s_funders", async () => {
            const accounts = await ethers.getSigners();

            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasPrice * gasUsed;

            const endingFundMeBakance = await ethers.provider.getBalance(
                fundMe.target
            );
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBakance, 0);
            assert.equal(
                (endingDeployerBalance + gasCost).toString(),
                (startingDeployerBalance + startingFundMeBalance).toString()
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i]),
                    0
                );
            }
        });

        it("Cheaper withdraw...", async () => {
            const accounts = await ethers.getSigners();

            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({ value: sendValue });
            }

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);

            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasPrice * gasUsed;

            const endingFundMeBakance = await ethers.provider.getBalance(
                fundMe.target
            );
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBakance, 0);
            assert.equal(
                (endingDeployerBalance + gasCost).toString(),
                (startingDeployerBalance + startingFundMeBalance).toString()
            );

            await expect(fundMe.getFunder(0)).to.be.reverted;

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i]),
                    0
                );
            }
        });

        it("Only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1]; 
            const attackerConnectedContract = fundMe.connect(attacker);
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe, "fundme__NotOwner");
        })
    });
});
