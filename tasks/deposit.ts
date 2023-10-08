import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task("deposit", "Deposits tokens into Farming contract")
  .addParam("farmingContract", "The Farming contract address")
  .addParam("amount", "Amount of tokens to deposit")
  .setAction(async ({ farmingContract, amount }, { ethers }) => {

    const Farming = await ethers.getContractFactory("Farming");
    const contract = Farming.attach(farmingContract);

    const amountInEther = ethers.utils.parseEther(amount)

    const tx: ContractTransaction = await contract.deposit(amountInEther);

    console.log(`Depositing ${amount} staking tokens...`);

    const contractReceipt: ContractReceipt = await tx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Deposited');
    const eInitiator: Address = event?.args!['addr'];
    const depositAmount: BigNumber = event?.args!['amount'];
    const etherDepositAmount = ethers.utils.formatEther(depositAmount);

    console.log(`Tokens deposited!`);
    console.log(`Initiator: ${eInitiator}`);
    console.log(`Deposit of ${etherDepositAmount} staking tokens completed successfully!`);
  });