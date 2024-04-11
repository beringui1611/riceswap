// import {
//   loadFixture,
// } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { expect } from "chai";
// import { ethers } from "hardhat";

// describe("RiceCoin", function () {
//   const VALUE = 1_000_000_000_000_000_000n;
//   async function deployFixture() {
//     const [owner, otherAccount] = await ethers.getSigners();

//     const SkrRice = await ethers.getContractFactory("RiceSkr");
//     const skrRice = await SkrRice.deploy();

//     const RiceCoin = await ethers.getContractFactory("RiceCoin");
//     const ricecoin = await RiceCoin.deploy();

//     return { ricecoin, skrRice, owner, otherAccount };
//   }

//   describe("Deployment", function () {
//     it("Should decimals", async function () {
//       const { ricecoin } = await loadFixture(deployFixture);
//       expect(await ricecoin.decimals()).to.equal(18)
//     });

//     it("Should burn", async function () {
//       const { ricecoin, owner} = await loadFixture(deployFixture);
//       const IOwner = ricecoin.connect(owner);
//       await IOwner.burn(VALUE);
//       expect(await ricecoin.balanceOf(owner.address)).to.equal(1360449999000000000000000000n, "balance");
//     });

//     it("Should burn (NOT PERMISSION)", async function () {
//       const { ricecoin, otherAccount} = await loadFixture(deployFixture);
//       const IOther = ricecoin.connect(otherAccount);
//       await expect(IOther.burn(VALUE)).to.be.revertedWith("you do not permission");
//     });


//     it("Should addskr", async function () {
//       const { skrRice, ricecoin} = await loadFixture(deployFixture);
//       await ricecoin.addSkr(skrRice.target);
//       expect(await ricecoin.skrOriginal()).to.equal(skrRice.target);
//     });

//     it("Should addskr (NOT PERMISSION)", async function () {
//       const { skrRice, ricecoin, otherAccount} = await loadFixture(deployFixture);
//       const IOther = ricecoin.connect(otherAccount);
//       await expect(IOther.addSkr(skrRice.target)).to.be.revertedWith("you do not permission");
//     });


//     it("Should mint", async function () {
//       const { skrRice, owner} = await loadFixture(deployFixture);
//       await skrRice.mint();
//       expect(await skrRice.balanceOf(owner.address)).to.equal(1);
//     });

//     it("Should mint (> 1)", async function () {
//       const { skrRice} = await loadFixture(deployFixture);
//         await skrRice.mint()
//         await expect(skrRice.mint()).to.be.revertedWith("skr already exist");
//     });

//     it("Should mint (NOT PERMISSION)", async function () {
//       const { skrRice, otherAccount} = await loadFixture(deployFixture);
//       const IOther = skrRice.connect(otherAccount);
//       await expect(IOther.mint()).to.be.revertedWith("you do not permission")

//     });

//     it("Should tokenURI", async function () {
//       const { skrRice} = await loadFixture(deployFixture);
//       await skrRice.mint();
//       const tokenURI = await skrRice.tokenURI(1);
//       expect(tokenURI).to.equal("https://www.luiztools.com.br/nfts/1.json")
//     });

//   });
// });
