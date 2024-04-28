// import {
//     loadFixture,
//     time,
//   } from "@nomicfoundation/hardhat-toolbox/network-helpers";
//   import { expect } from "chai";
// import { ZeroAddress } from "ethers";
//   import { ethers } from "hardhat";
// import { math } from "../../typechain-types/@openzeppelin/contracts/utils";

//   describe("RiceCoin", function () {
//    const TIME = 30 *24 *60 *60;
//    const AMOUNT = 1000_000_000_000_000_000_000n;
//     async function deployFixture() {
//       const [owner, otherAccount, account2, account3] = await ethers.getSigners();

//         const RiceCoin = await ethers.getContractFactory("RiceCoin");
//         const ricecoin = await RiceCoin.deploy();

//         const Governance = await ethers.getContractFactory("RiceswapGovernance");
//         const governance = await Governance.deploy(ricecoin, 2);

//       return {governance};
//     }

//     describe("Deployment", function () {
//       it("Should vote", async function () {
//         const {governance} = await loadFixture(deployFixture);
//         await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");

//         console.log(await governance.getProposal());
//       }); 

//        it("Should vote", async function () {
//          const {governance} = await loadFixture(deployFixture);
//          await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");
//          await governance.getProposal();

//          await governance.vote(0, 1);

//          const result = await governance.getProposal()

//          console.log(result);
//        }); 

//        it("Should closeVote YES", async function () {
//         const {governance} = await loadFixture(deployFixture);
//         await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");
//         const hash = await governance.proposalData(0);

//         for(let i =0; i < 3; i++){
//           await governance.vote(0, 0);
//         }
//         await time.increase(10 *24 *60 *60);
//         const res1 = await governance.getProposal()
//         console.log(res1);

//         await governance.closeVote(0);

//         const res = await governance.executeds(hash.hash)
//         console.log(res)

//         const res2 = await governance.getProposal()
//         console.log(res2);

//       }); 

//       it("Should closeVote NO", async function () {
//         const {governance} = await loadFixture(deployFixture);
//         await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");
//         const hash = await governance.proposalData(0);

//         for(let i =0; i < 3; i++){
//           await governance.vote(0, 1);
//         }
//         await time.increase(10 *24 *60 *60);
//         const res1 = await governance.getProposal()
//         console.log(res1);

//         await governance.closeVote(0);

//         const res = await governance.executeds(hash.hash)
//         console.log(res)

//       }); 

//       it("Should closeVote NULL", async function () {
//         const {governance} = await loadFixture(deployFixture);
//         await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");
//         const hash = await governance.proposalData(0);

//         for(let i =0; i < 3; i++){
//           await governance.vote(0, 2);
//         }
//         await time.increase(10 *24 *60 *60);
//         const res1 = await governance.getProposal()
//         console.log(res1);

//         await governance.closeVote(0);

//         const res = await governance.executeds(hash.hash)
//         console.log(res +    'NULL')  
//         const res2 = await governance.getProposal()
//         console.log(res2 +   'NULL');

//       }); 

//       it("Should closeVote TIED", async function () {
//         const {governance} = await loadFixture(deployFixture);
//         await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");
//         const hash = await governance.proposalData(0);

//         for(let i =0; i < 3; i++){
//           await governance.vote(0, 0);
//         }

//         for(let i =0; i < 3; i++){
//           await governance.vote(0, 1);
//         }

//         await time.increase(10 *24 *60 *60);
//         const res1 = await governance.getProposal()
//         console.log(res1);

//         await governance.closeVote(0);

//         const res = await governance.executeds(hash.hash)
//         console.log(res)  

//         const res2 = await governance.getProposal()
//         console.log(res2);


//       }); 


//       it("Should closeVote RANDOM VOTINGS", async function () {
//         const {governance} = await loadFixture(deployFixture);
//         await governance.initProposal("CONTRATAR UM ADMINISTRADOR DE POOLS", "na minha opinião....");
//         const hash = await governance.proposalData(0);

//         const YES = Math.floor(Math.random() * 100);
//         const NO = Math.floor(Math.random() * 100);
//         const NULL = Math.floor(Math.random() * 100);

//         for(let i =0; i < YES; i++){
//           await governance.vote(0, 0);
//         }

//         for(let i =0; i < NO; i++){
//           await governance.vote(0, 1);
//         }
      
//         for(let i =0; i < NULL; i++){
//           await governance.vote(0, 2);
//         }
        
//         await time.increase(10 *24 *60 *60);
//         const res1 = await governance.getProposal()
//         console.log(res1);

//         await governance.closeVote(0);

//         const res = await governance.executeds(hash.hash)
//         console.log(res)  

//       }); 

   
//     });
// });