import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const REWARD_TOKEN_NAME = "RewardToken";

task("approve", "Approved to spend from a farming contract")
.addParam("rewardToken", "Reward token address")
.addParam("farmingContract", "Farming contract address")
.setAction(async ({rewardToken, farmingContract}, { ethers }) => {
    const RewardToken = await ethers.getContractFactory(REWARD_TOKEN_NAME);
    const tokenContract = RewardToken.attach(rewardToken);

    const totalAmount: BigNumber = ethers.utils.parseEther("1000");
    const percentage = 1000;
    const amountOfEpochs = 3;
    const HUNDRED_PERCENT = 10000;

    const expectedReward = (totalAmount.mul(percentage).mul(amountOfEpochs)).div(HUNDRED_PERCENT)

    const contractTx: ContractTransaction = await tokenContract.approve(farmingContract, expectedReward);
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Approval');
    const Owner: Address = event?.args!['owner'];
    const Spender: Address = event?.args!['spender'];
    const Amount: BigNumber = event?.args!['value'];
    const etherAmount = ethers.utils.formatEther(Amount);

    console.log(`Reward token owner: ${Owner}`);
    console.log(`Farming Contract: ${Spender}`);
    console.log(`Reward: ${etherAmount}`);
    console.log(`Approved ${Spender} to spend ${etherAmount} ${REWARD_TOKEN_NAME}'s`);
});
