//  import {
//      loadFixture,
//    } from "@nomicfoundation/hardhat-toolbox/network-helpers";
//    import { expect } from "chai";
//    import { ethers } from "hardhat";
 
//    describe("RiceCoin", function () {
//      async function deployFixture() {
//        const [owner, otherAccount] = await ethers.getSigners();
 
//        const Percent = await ethers.getContractFactory("DataConsumerV3");
//        const percent = await Percent.deploy();
 
//        return {percent};
//      }
 
//      describe("Deployment", function () {
//        it("Should decimals", async function () {
//          const { percent } = await loadFixture(deployFixture);
//           const res = await percent.getChainlinkDataFeedLatestAnswer()
//           console.log(res)
//        }); 
//      });
//    });
 