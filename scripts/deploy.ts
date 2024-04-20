import { ethers } from "hardhat";

async function main() {
 
  // const riceswap = await ethers.deployContract("RiceSwap20");
  // await riceswap.waitForDeployment();

  // const riceCoin = await ethers.deployContract("RiceCoin");
  // await riceCoin.waitForDeployment();

  const buyCrypto = await ethers.deployContract("DataConsumerV3");
  await buyCrypto.waitForDeployment();

  // console.log(` coin ${riceCoin.target}`)

  console.log(` coin ${buyCrypto.target}`)

  // console.log(
  //   `swap ${riceswap.target}`
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
