import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { Farming } from "../src/types/Farming";
import { Farming__factory } from "../src/types/factories/Farming__factory";

const CONTRACT_NAME = "Farming";

describe("Farming contract", function () {
    let farmingContract: Farming;
    let stakingToken: Contract;
    let rewardToken: Contract;
    let owner: SignerWithAddress;
    const INITIAL_TOKENS_AMOUNT: BigNumber = ethers.utils.parseUnits("10000000", "18");
    const HUNDRED_PERCENT = 10000;

    const totalAmount: BigNumber = ethers.utils.parseEther("1000");
    const percentage = 1000;
    const epochDuration = 2592000; 
    const amountOfEpochs = 3;
    const startTime = Math.floor(Date.now() / 1000) + 60;

    const expectedReward = (totalAmount.mul(percentage).mul(amountOfEpochs)).div(HUNDRED_PERCENT)
  
    beforeEach(async () => {
        
      [owner] = await ethers.getSigners();

      const StakingToken = await ethers.getContractFactory("StakingToken");
      stakingToken = await StakingToken.deploy(); 

      const RewardToken = await ethers.getContractFactory("RewardToken");
      rewardToken = await RewardToken.deploy();
  
      const farmingFactory = (await ethers.getContractFactory(CONTRACT_NAME, owner)) as Farming__factory;
      farmingContract = await farmingFactory.deploy(stakingToken.address, rewardToken.address);
    });

    describe("Initial params of token contracts", async () => {
        it("Initializes name, symbol and decimals correctly", async () => {
            expect(await stakingToken.name()).to.equal("StakingToken");
            expect(await stakingToken.symbol()).to.equal("STT");
            expect(await stakingToken.decimals()).to.equal(18);
  
            expect(await rewardToken.name()).to.equal("RewardToken");
            expect(await rewardToken.symbol()).to.equal("RWT");
            expect(await rewardToken.decimals()).to.equal(18);
            });
      
        it("should have the correct owner", async () => {
            expect(await stakingToken.owner()).to.equal(owner.address);
            expect(await rewardToken.owner()).to.equal(owner.address);
            });
           
        it("should have the correct initial total supply", async () => {
            expect(await stakingToken.totalSupply()).to.equal(INITIAL_TOKENS_AMOUNT);
            expect(await rewardToken.totalSupply()).to.equal(INITIAL_TOKENS_AMOUNT);
            });
      
        it("should have the correct initial balance for the owner", async () => {
              expect(await stakingToken.balanceOf(owner.address)).to.equal(INITIAL_TOKENS_AMOUNT);
              expect(await rewardToken.balanceOf(owner.address)).to.equal(INITIAL_TOKENS_AMOUNT);
              });
    });

    describe("Contract logic", function () {
  
        describe("initialize function", async () => {

            beforeEach(async () => {
            await rewardToken.connect(owner).approve(farmingContract.address, expectedReward);
        });

        it("should initialize properly", async () => {

            await farmingContract.initialize(
                totalAmount,
                percentage,
                epochDuration,
                amountOfEpochs,
                startTime
            );

            expect(await farmingContract.initialized()).to.be.true;
            expect(await farmingContract.tokensLeft()).to.equal(totalAmount);
            expect(await farmingContract.percentage()).to.equal(percentage);
            expect(await farmingContract.epochDuration()).to.equal(epochDuration);
            expect(await farmingContract.amountOfEpochs()).to.equal(amountOfEpochs);
            expect(await farmingContract.startTime()).to.equal(startTime);
            
            const balance = await rewardToken.balanceOf(farmingContract.address);
            expect(balance).to.equal(expectedReward);
        });
    });
        describe("deposit", async () => {

            beforeEach(async () => {
                await rewardToken.connect(owner).approve(farmingContract.address, expectedReward);

                await ethers.provider.send("evm_setNextBlockTimestamp", [startTime]);

                await farmingContract.initialize(
                    totalAmount,
                    percentage,
                    epochDuration,
                    amountOfEpochs,
                    startTime
                );
              });
        
        it("should deposit tokens", async () => {
            const amount: BigNumber = ethers.utils.parseEther("1000");
            await stakingToken.connect(owner).approve(farmingContract.address, amount); 
    
            await expect(farmingContract.deposit(amount))
            .to.emit(farmingContract, "Deposited")
            .withArgs(owner.address, amount);

            const user = await farmingContract.users(owner.address);
            expect(user.amount).to.equal(amount);
            expect(BigNumber.from(user.depositTime)).to.be.gt(BigNumber.from(startTime));
            expect(user.claimed).to.be.false;

            const contractBalance = await stakingToken.balanceOf(farmingContract.address);
            expect(contractBalance).to.equal(amount);

            const ownerBalance: BigNumber = await stakingToken.balanceOf(owner.address);
            const totalSupply: BigNumber = await stakingToken.totalSupply();
            expect(ownerBalance).to.equal(totalSupply.sub(amount));

            const tokensLeft = await farmingContract.tokensLeft();
            expect(tokensLeft).to.equal(totalAmount.sub(amount));
        });
    });
  
        describe("claimRewards", () => {
            beforeEach(async () => {

                const amount: BigNumber = ethers.utils.parseEther("1000");
                await rewardToken.connect(owner).approve(farmingContract.address, expectedReward);
                await stakingToken.connect(owner).approve(farmingContract.address, amount); 

                await farmingContract.initialize(
                    totalAmount,
                    percentage,
                    epochDuration,
                    amountOfEpochs,
                    startTime
                );

                await farmingContract.deposit(amount)

              });
            
        it("should claim rewards", async () => {
            await ethers.provider.send("evm_increaseTime", [3 * epochDuration]); // 3 months

            const userBeforeFarming = await farmingContract.users(owner.address);

            const _expectedReward = (userBeforeFarming.amount.mul(percentage).mul(amountOfEpochs)).div(HUNDRED_PERCENT)

            await expect(farmingContract.claimRewards())
            .to.emit(farmingContract, "RewardClaimed")
            .withArgs(owner.address, _expectedReward);

            const userAfterFarming = await farmingContract.users(owner.address);
            expect(userAfterFarming.claimed).to.be.true;  

            const ownerBalance = await rewardToken.balanceOf(owner.address);
            const contractBalance = await rewardToken.balanceOf(farmingContract.address);
            expect(ownerBalance).to.equal(INITIAL_TOKENS_AMOUNT.sub(contractBalance));

            const totalRewards = await farmingContract.totalRewards();
            expect(totalRewards).to.eq(_expectedReward);
        });
     });

     describe("withdraw", () => {

        beforeEach(async () => {
            const depositAmount: BigNumber = ethers.utils.parseEther("1000");
                await rewardToken.connect(owner).approve(farmingContract.address, expectedReward);
                await stakingToken.connect(owner).approve(farmingContract.address, depositAmount); 

                await farmingContract.initialize(
                    totalAmount,
                    percentage,
                    epochDuration,
                    amountOfEpochs,
                    startTime
                );

                await farmingContract.deposit(depositAmount)

                const _epochDuration = 2592000; 
                await ethers.provider.send("evm_increaseTime", [3 * _epochDuration]); // 3 months
          });

          it("should withdraw tokens", async () => {
            await farmingContract.claimRewards(); // getting rewards

            const userBeforeWithdraw = await farmingContract.users(owner.address);
            const amount = userBeforeWithdraw.amount;
            expect(amount).to.equal(ethers.utils.parseEther("1000"));

            const ownerBalanceBefore = await stakingToken.balanceOf(owner.address);
            expect(ownerBalanceBefore).to.equal((INITIAL_TOKENS_AMOUNT.sub(amount)))

            await expect(farmingContract.withdraw())
            .to.emit(farmingContract, "Withdrawn")
            .withArgs(owner.address, amount);

            const userAfterWithdraw = await farmingContract.users(owner.address);
            expect(userAfterWithdraw.amount).to.equal(0);

            const contractBalance = await stakingToken.balanceOf(farmingContract.address);
            expect(contractBalance).to.equal(0);

            const ownerBalance = await stakingToken.balanceOf(owner.address);
            const totalSupply: BigNumber = await stakingToken.totalSupply();
            expect(ownerBalance).to.equal(totalSupply);
          });

          it('should revert if rewards not claimed', async () => {
            const user = await farmingContract.users(owner.address);
    
            expect(user.claimed).to.be.false;
            await expect(farmingContract.withdraw()).to.revertedWith('Rewards not claimed');
          });
     });
  });
});