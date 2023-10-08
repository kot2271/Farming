import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task("claim", "Claims farming rewards")
  .addParam("farmingContract", "The Farming contract address")
  .setAction(async ({ farmingContract }, { ethers }) => {

    const Farming = await ethers.getContractFactory("Farming");
    const contract = Farming.attach(farmingContract);

    console.log("Claiming rewards...");

    const tx: ContractTransaction = await contract.claimRewards();

    const contractReceipt: ContractReceipt = await tx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'RewardClaimed');
    const eInitiator: Address = event?.args!['addr'];
    const claimAmount: BigNumber = event?.args!['amount'];

    const rewards = await contract.totalRewards();
    const etherRewards = ethers.utils.formatEther(rewards);
    const etherClaimAmount = ethers.utils.formatEther(claimAmount);

    console.log(`Rewards claimed: ${etherRewards} !`);
    console.log(`Initiator: ${eInitiator}`);
    console.log(`A claim of ${etherClaimAmount} reward_tokens for farming has been successfully received!`);
  });