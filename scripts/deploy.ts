import { ethers, run, network } from "hardhat";

const delay = async (time: number) => {
  return new Promise((resolve: any) => {
    setInterval(() => {
      resolve()
    }, time)
  })
}

async function main() {

  const rwtName = "RewardToken";
  const rwtSymbol = "RWT";

  const RewardToken = await ethers.getContractFactory(rwtName);
  const rewardToken = await RewardToken.deploy();

  await rewardToken.deployed();

  console.log(`${rwtName} contract deployed to: ${rewardToken.address}`);
  console.log('Wait for delay...');
  await delay(20000); // 20 seconds
  console.log(`Starting verify ${rwtName}...`);

  try {
    await run('verify', {
      address: rewardToken!.address,
      constructorArguments: [rwtName, rwtSymbol],
      contract: 'contracts/RewardToken.sol:RewardToken',
      network: 'polygon-mumbai'
    });
    console.log('Verify success')
  } catch(e: any) {
    console.log(e.message)
  }


  const sttName = "StakingToken";
  const sttSymbol = "STT";

  const StakingToken = await ethers.getContractFactory(sttName);
  const stakingToken = await StakingToken.deploy();

  await stakingToken.deployed();

  console.log(`${sttName} contract deployed to: ${stakingToken.address}`);
  console.log('Wait for delay...');
  await delay(20000); // 20 seconds
  console.log(`Starting verify ${sttName}...`);

  try {
    await run('verify', {
      address: stakingToken!.address,
      constructorArguments: [sttName, sttSymbol],
      contract: 'contracts/StakingToken.sol:StakingToken',
      network: 'polygon-mumbai'
    });
    console.log('Verify success')
  } catch(e: any) {
    console.log(e.message)
  }


  let farmingContract;

  try {
  const ContractFactory = await ethers.getContractFactory("Farming");
  const signer = (await ethers.getSigners())[0];
  farmingContract = await ContractFactory.connect(signer).deploy(stakingToken.address, rewardToken.address)
  await farmingContract.deployed();

  console.log(`Farming Contract deployed to: ${farmingContract.address}`);
  } catch (e: any) {
    console.log(e.message)
  }
  console.log('Wait for delay...');
  await delay(60000);
  console.log('Starting verify Farming contract...');

  try {
    await run('verify', {
      address: farmingContract!.address,
      constructorArguments: [stakingToken.address, rewardToken.address],
      contract: 'contracts/Farming.sol:Farming',
      network: 'polygon-mumbai'
    });
    console.log('Verify success')
  } catch(e: any) {
    console.log(e.message)
  }

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });