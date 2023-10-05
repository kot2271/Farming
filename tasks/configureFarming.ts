import { task } from "hardhat/config";
import { ContractTransaction } from "ethers";


task("configureFarming", "Configures farming parameters")
  .addParam("contract", "The Farming contract")
  .setAction(async ({ contract }, { ethers }) => {

    const Contract = await ethers.getContractFactory("Farming");
    const farmingContract = Contract.attach(contract);

    console.log("Configuring farming parameters...");

    const tx: ContractTransaction = await farmingContract.configureFarmingParameters(
      1000, // _totalRewardAmount 
      1000, // _rewardPercentage
      2592000, // _epochLengthInSeconds  
      3,  // _numberOfEpochs
      Math.floor(Date.now() / 1000) + 60 // _startTime
    );

    await tx.wait();

    console.log("Farming parameters configured!");

  });