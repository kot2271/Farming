import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

const STAKING_TOKEN_NAME = "StakingToken";

task("approveStaking", "Approved to spend from a farming contract")
.addParam("stakingToken", "Staking token address")
.addParam("farmingContract", "Farming contract address")
.addParam("amount", "Amount of tokens to deposit")
.setAction(async ({ stakingToken, farmingContract, amount }, { ethers }) => {
    const StakingToken = await ethers.getContractFactory(STAKING_TOKEN_NAME);
    const tokenContract = StakingToken.attach(stakingToken);

    const amountInEther = ethers.utils.parseEther(amount)

    const contractTx: ContractTransaction = await tokenContract.approve(farmingContract, amountInEther);
    const contractReceipt: ContractReceipt = await contractTx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Approval');
    const Owner: Address = event?.args!['owner'];
    const Spender: Address = event?.args!['spender'];
    const Amount: BigNumber = event?.args!['value'];
    const etherAmount = ethers.utils.formatEther(Amount);  

    console.log(`Staking token owner: ${Owner}`);
    console.log(`Farming Contract: ${Spender}`);
    console.log(`Amount: ${etherAmount}`);
    console.log(`Approved ${Spender} to spend ${etherAmount} ${STAKING_TOKEN_NAME}'s`);
});