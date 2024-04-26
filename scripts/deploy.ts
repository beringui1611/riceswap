import { ethers } from "hardhat";

async function main() {
 
  // const riceswap = await ethers.deployContract("RiceSwap20");
  // await riceswap.waitForDeployment();

  // const riceCoin = await ethers.deployContract("RiceCoin");
  // await riceCoin.waitForDeployment();

  const Factory = await ethers.deployContract("RiceswapV1Factory");
  await Factory.waitForDeployment();

  console.log(`factory hash ${Factory.target}`)

  const Router = await ethers.deployContract("RiceswapV1Router");
  await Router.waitForDeployment();

  console.log(`router hash ${Router.target}`)


  ;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
