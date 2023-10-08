import { task } from "hardhat/config";
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task("withdraw", "Withdraws tokens from Farming contract")
 .addParam("contract", "The Farming contract address")
 .setAction(async ({ contract }, { ethers }) => {

    const Farming = await ethers.getContractFactory("Farming");
    const farming = Farming.attach(contract);

    const [signer] = await ethers.getSigners();

    console.log("Withdrawing tokens...");

    const tx: ContractTransaction = await farming.connect(signer).withdraw();

    const contractReceipt: ContractReceipt = await tx.wait();
    const event = contractReceipt.events?.find(event => event.event === 'Withdrawn');
    const eInitiator: Address = event?.args!['addr'];
    const withdrawAmount: BigNumber = event?.args!['amount']; 

    const etherWithdrawAmount = ethers.utils.formatEther(withdrawAmount);
    const user = await farming.users(await signer.getAddress());
    const etherUserAmount = ethers.utils.formatEther(user.amount);

    console.log(`Staking tokens in amount of ${etherWithdrawAmount} withdrawn by user: ${eInitiator} !`)
    console.log(`Remaining deposit: ${etherUserAmount}`);
});