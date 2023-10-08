import { task } from "hardhat/config";
import { BigNumber, ContractTransaction } from "ethers";

task("initializeFarming", "Initializes the Farming contract")
.addParam("farmingContract", "Farming contract address")
.setAction(async ({ farmingContract }, { ethers }) => {

    const Contract = await ethers.getContractFactory("Farming");
    const farming = Contract.attach(farmingContract);

    console.log("Initializing Farming contract...");

    const totalAmount: BigNumber = ethers.utils.parseEther("1000");
    const percentage = 1000; 
    const epochDuration = 2592000; 
    const amountOfEpochs = 3;
    const startTime = Math.floor(Date.now() / 1000) + 60;

    const farmingTx: ContractTransaction = await farming.initialize(
      totalAmount, 
      percentage,
      epochDuration,
      amountOfEpochs,
      startTime
    );

    await farmingTx.wait();

    const tokensLeft = await farmingContract.tokensLeft();
    const etherTokensLeft = ethers.utils.formatEther(tokensLeft);

    console.log(`Farming contract initialized: ${await farmingContract.initialized()}`);
    console.log(`Farming contract tokensLeft: ${etherTokensLeft}`);
    console.log(`Farming contract percentage: ${await farmingContract.percentage()}`);
    console.log(`Farming contract epochDuration: ${await farmingContract.epochDuration()}`);
    console.log(`Farming contract amountOfEpochs: ${await farmingContract.amountOfEpochs()}`);
    console.log(`Farming contract startTime: ${await farmingContract.startTime()}`);
  });