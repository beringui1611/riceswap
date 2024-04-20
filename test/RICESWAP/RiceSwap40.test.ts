import {
    loadFixture, time,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
import { N, ZeroAddress } from "ethers";
  import { ethers } from "hardhat";
import { token } from "../../typechain-types/@openzeppelin/contracts";

 
  describe("RiceCoin", function () {
    const TIME = 30 *24 *60 *60;
    const AMOUNT = 1000010000000000000000000n;
    async function deployFixture() {
        
      const [owner, otherAccount, accountTwo] = await ethers.getSigners();
 
      const RiceSwap = await ethers.getContractFactory("RiceSwap40");
      const riceswap = await RiceSwap.deploy();

      const Coin = await ethers.getContractFactory("RiceCoin");
      const coin = await Coin.deploy();

      const USDT = await ethers.getContractFactory("Usdt");
      const usdt = await USDT.deploy();
 
      return {riceswap, coin, usdt, owner, otherAccount, accountTwo};
    }
 
    describe("Deployment", function () {
      it("Should createpool", async function () {
        const { riceswap, coin, usdt, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);
          const tx = await riceswap.createPool(coin.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100);
          const txUsed = await tx.wait();
          console.log(`createPool: ${txUsed?.gasUsed}`)

          expect(await coin.balanceOf(riceswap.target)).to.equal(999500000000000000000000n);
          expect(await usdt.balanceOf(riceswap.target)).to.equal(10000000000000000000n);
          expect(await coin.balanceOf(owner.address)).to.equal(1359450500000000000000000000n)
      }); 

      it("Should not createpool (ALREADY EXIST)", async function () {
        const { riceswap, coin, usdt, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);
          await riceswap.createPool(coin.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);

          await expect(riceswap.createPool(coin.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)).to.be.revertedWithCustomError(riceswap, "IRCNPoolAlreadyExist");
         
      }); 

      
      it("Should not createpool (AMOUNT < 100k)", async function () {
        const { riceswap, coin, usdt} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);
          await expect(riceswap.createPool(coin.target, usdt.target, 90_000_000_000_000_000_000_000n, 10000000000000000000n, TIME, 1n, 100)).to.be.revertedWithCustomError(riceswap, "IRCNAmount");
      }); 

      it("Should not createpool (AMOUNT < 100k)", async function () {
        const { riceswap, coin, usdt} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);
          await expect(riceswap.createPool(coin.target, ZeroAddress, 100_000_000_000_000_000_000_000n, 10000000000000000000n, TIME, 1n, 100)).to.be.revertedWithCustomError(riceswap, "IRCNAddressZero");
      }); 

      it("Should get pool", async function () {
        const { riceswap, coin, usdt} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,200_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 200_000_0000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)
          await riceswap.createPool(usdt.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

           const POOL = await riceswap.verifyPool(coin.target)
           const POOLTWO = await riceswap.verifyPool(usdt.target);
           console.log(POOLTWO)
           console.log(POOL)
          expect(POOL).to.equal(POOL)
      });

      it("Should farm", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          const tx = await IOtherSwap.farm(coin.target, 10000000000000000000n);
          const txUsed = await tx.wait();
          console.log(`farm: ${txUsed?.gasUsed}`)

          expect(await IOtherSwap._farming(coin.target, otherAccount.address)).to.equal(10000000000000000000n)
          expect(await coin.balanceOf(riceswap.target)).to.equal(999510000000000000000000n)
          expect(await coin.balanceOf(otherAccount.address)).to.equal(0n);
          
      });

      it("Should not farm (USER DO HAVE BALANCE)", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 1000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 1000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await expect(IOtherSwap.farm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "IRCNBalanceOfInsufficient");
          
      });

      it("Should not farm (PROTCOL NOT EXIST)", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await usdt.transfer(otherAccount.address, 10000000000000000000n)
        const IOther = usdt.connect(otherAccount);
        await IOther.approve(riceswap.target, 10000000000000000000n);

        const IOtherSwap = riceswap.connect(otherAccount);
        await expect(IOtherSwap.farm(usdt.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "IRCNProtocolNotExist");
          
      });

      it("Should not farm (AMOUNT <= 0)", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await coin.transfer(otherAccount.address, 10000000000000000000n)
        const IOther = coin.connect(otherAccount);
        await IOther.approve(riceswap.target, 10000000000000000000n);


        const IOtherSwap = riceswap.connect(otherAccount);
        await expect(IOtherSwap.farm(coin.target, 0n)).to.be.revertedWithCustomError(riceswap, "IRCNAmount");
          
      });

      it("Should not farm (ALLOWANCE < AMOUNT)", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await coin.transfer(otherAccount.address, 10000000000000000000n)
        const IOther = coin.connect(otherAccount);
        await IOther.approve(riceswap.target, 1000000000000000000n);


        const IOtherSwap = riceswap.connect(otherAccount);
        await expect(IOtherSwap.farm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "IRCNNotApprove");
          
      });

      it("Should removeFarm", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await coin.transfer(otherAccount.address, 10000000000000000000n)
        const IOther = coin.connect(otherAccount);
        await IOther.approve(riceswap.target, 10000000000000000000n);


        const IOtherSwap = riceswap.connect(otherAccount);
        await IOtherSwap.farm(coin.target, 10000000000000000000n);

        await time.increase(30 *24 *60 *60);

        const tx = await IOtherSwap.removeFarm(coin.target, 10000000000000000000n)
        const txUsed = await tx.wait();
        console.log(`removeFarm: ${txUsed?.gasUsed}`)

        expect(await riceswap._farming(coin.target, otherAccount.address)).to.equal(0n)
        expect(await coin.balanceOf(riceswap.target)).to.equal(999500000000000000000000n);
        expect(await coin.balanceOf(otherAccount.address)).to.equal(10000000000000000000n)
      });

      it("Should not removeFarm (TIME BLOCK)", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await coin.transfer(otherAccount.address, 10000000000000000000n)
        const IOther = coin.connect(otherAccount);
        await IOther.approve(riceswap.target, 10000000000000000000n);


        const IOtherSwap = riceswap.connect(otherAccount);
        await IOtherSwap.farm(coin.target, 10000000000000000000n);

        await time.increase(29 *24 *60 *60);

        await expect(IOtherSwap.removeFarm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "IRCNTimeNotExpired")

      });


      it("Should not removeFarm (removefarm amount < farming)", async function () {
        const { riceswap, coin, usdt, otherAccount} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await coin.transfer(otherAccount.address, 10000000000000000000n)
        const IOther = coin.connect(otherAccount);
        await IOther.approve(riceswap.target, 10000000000000000000n);


        const IOtherSwap = riceswap.connect(otherAccount);
        await IOtherSwap.farm(coin.target, 10000000000000000000n);

        await time.increase(30 *24 *60 *60);

        await expect(IOtherSwap.removeFarm(coin.target, 100000000000000000000n)).to.be.revertedWithCustomError(riceswap, "IRCNInsufficientFarming")
      
      });

    

      it("Should payholders", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10_000_000_000_000_000_000n, TIME, 1n, 1000)

          await coin.transfer(otherAccount.address, 1000_000_000_000_000_000_000n);
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 1000_000_000_000_000_000_000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 1000_000_000_000_000_000_000n);

          await time.increase(30 *24 *60 *60);

          const tx = await IOtherSwap.payholders(coin.target);
          const txUse = await tx.wait();
          console.log("payholders" + txUse?.gasUsed)

          expect(await usdt.balanceOf(otherAccount.address)).to.equal(5_000_000_000_000_000_00n);
          expect(await usdt.balanceOf(owner.address)).to.equal(1360449990500000000000000000n, "owner");
          expect(await usdt.totalSupply()).to.equal(1360449990500000000000000000n + 9500000000000000000n);
      });


      it("Should payholders (VARIABLE AND INDEX UPDATED)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10_000_000_000_000_000_000n, TIME, 1n, 1000)

          await coin.transfer(otherAccount.address, 1000_000_000_000_000_000_000n);
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 1000_000_000_000_000_000_000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 1000_000_000_000_000_000_000n);

          await time.increase(30 *24 *60 *60);

          const tx = await IOtherSwap.payholders(coin.target);
          const txUse = await tx.wait();
          console.log("payholders" + txUse?.gasUsed)

          expect(await usdt.balanceOf(otherAccount.address)).to.equal(5_000_000_000_000_000_00n);
          expect(await usdt.balanceOf(owner.address)).to.equal(1360449990500000000000000000n, "owner");
          expect(await usdt.totalSupply()).to.equal(1360449990500000000000000000n + 9500000000000000000n);
      });


      
      it("Should not payholders (PROTOCOL NOT EXIST)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await time.increase(30 *24 *60 *60);

          await expect(IOtherSwap.payholders(usdt.target)).to.be.revertedWithCustomError(riceswap, "IRCNPoolAlreadyExist")
      });

      it("Should payholders (TIME NOT EXPIRED)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await time.increase(29 *24 *60 *60);

          await expect(IOtherSwap.payholders(coin.target)).to.be.revertedWithCustomError(riceswap, "IRCNTimeNotExpired")
             
      });


      it("Should payholders (PROTOCOL NOT LIQUIDITY)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 0n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n);
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await time.increase(30 *24 *60 *60);

          await expect(IOtherSwap.payholders(coin.target)).to.be.revertedWithCustomError(riceswap, "IRCNInsufficientLiquidity")
             
      });


      it("Should validator", async function () {
        const { riceswap, coin, usdt, otherAccount, owner, accountTwo} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10_000_000_000_000_000_000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 1000_000_000_000_000_000_000n);
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 1000_000_000_000_000_000_000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 1000_000_000_000_000_000_000n);

          await time.increase(30 *24 *60 *60);

          const IAccountTwo = riceswap.connect(accountTwo);

         const tx = await IAccountTwo.validator(coin.target, otherAccount.address);
         const txUsed = await tx.wait();
         console.log("validator" + txUsed?.gasUsed)

         expect(await usdt.balanceOf(accountTwo.address)).to.equal(1_000_000_000_000_000_000n);
         expect(await usdt.balanceOf(otherAccount.address)).to.equal(8500000000000000000n);
         expect(await usdt.balanceOf(owner.address)).to.equal(1360449990500000000000000000n)

      });


      it("Should validator (variable)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner, accountTwo} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10_000_000_000_000_000_000n, TIME, 1n, 1000)

          await coin.transfer(otherAccount.address, 1000_000_000_000_000_000_000n);
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 1000_000_000_000_000_000_000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 1000_000_000_000_000_000_000n);

          await time.increase(30 *24 *60 *60);

          const IAccountTwo = riceswap.connect(accountTwo);

         const tx = await IAccountTwo.validator(coin.target, otherAccount.address);
         const txUsed = await tx.wait();
         console.log("validator" + txUsed?.gasUsed)

         expect(await usdt.balanceOf(accountTwo.address)).to.equal(1_000_000_000_000_000_00n); //10cents
         expect(await usdt.balanceOf(otherAccount.address)).to.equal(400000000000000000n); //40 cents
         expect(await usdt.balanceOf(owner.address)).to.equal(1360449990500000000000000000n)

      });


      it("Should validator (TIME NOT EXPIRED)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await time.increase(29 *24 *60 *60);

          await expect(IOtherSwap.validator(coin.target, otherAccount.address)).to.be.revertedWithCustomError(riceswap, "IRCNTimeNotExpired")
             
      });

      it("Should not validator (PROTOCOL NOT EXIST)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await time.increase(30 *24 *60 *60);

          await expect(IOtherSwap.validator(usdt.target, otherAccount.address)).to.be.revertedWithCustomError(riceswap, "IRCNPoolAlreadyExist")
      });


      it("Should validator (PROTOCOL NOT LIQUIDITY)", async function () {
        const { riceswap, coin, usdt, otherAccount, owner} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n);
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 0n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 10000000000000000000n);
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 10000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await time.increase(30 *24 *60 *60);

          await expect(IOtherSwap.validator(coin.target, otherAccount)).to.be.revertedWithCustomError(riceswap, "IRCNInsufficientLiquidity")
             
      });


      it("Should checkvalidator", async function () {
        const { riceswap, coin, usdt, otherAccount, accountTwo} = await loadFixture(deployFixture);

          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          await coin.transfer(otherAccount.address, 20000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 20000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          await coin.transfer(accountTwo.address, 10000000000000000000n)
          const IOtherTwo = coin.connect(accountTwo);
          await IOtherTwo.approve(riceswap.target, 20000000000000000000n);

          const IOtherSwapTwo = riceswap.connect(accountTwo);
          await IOtherSwapTwo.farm(coin.target, 10000000000000000000n);


          await coin.transfer(accountTwo.address, 10000000000000000000n)
          const IOther3 = coin.connect(accountTwo);
          await IOther3.approve(riceswap.target, 20000000000000000000n);

          const IOtherSwap3= riceswap.connect(accountTwo);
          await IOtherSwap3.farm(coin.target, 10000000000000000000n);

          await time.increase(TIME);
          await IOtherSwap3.removeFarm(coin.target , 10000000000000000000n)

          
          const result = await riceswap.checkValidators(coin.target);
          console.log(result);
          
          
      });


      it("Should updateFee", async function () {
        const { riceswap, owner} = await loadFixture(deployFixture);
          const IOwner = riceswap.connect(owner)
          await IOwner.updateFee(2);
          expect(await riceswap.viewFee()).to.equal(2);
      });

      it("Should updateFee (ADMIN)", async function () {
        const { riceswap, otherAccount} = await loadFixture(deployFixture);
          await riceswap.transferAdmin(otherAccount.address);
          const IOther = riceswap.connect(otherAccount);
          await IOther.updateFee(2);
          expect(await IOther.viewFee()).to.equal(2);
      });

      it("Should updatefee (NOT ADMIN)", async function () {
        const { riceswap, otherAccount} = await loadFixture(deployFixture);
          const IOther = riceswap.connect(otherAccount);
          await expect(IOther.updateFee(2)).to.be.revertedWith("ADMIN")
      });

      it("Should ownable updatefee (REMOVE ADMIN)", async function () {
        const { riceswap, otherAccount} = await loadFixture(deployFixture);
          await riceswap.transferAdmin(otherAccount.address);
          const IOther = riceswap.connect(otherAccount);
          await IOther.updateFee(2);

          await riceswap.unTransferAdmin(otherAccount.address);

          await expect(IOther.updateFee(2)).to.be.revertedWith("ADMIN");

      });


      it("Should punish", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          for(let i=0; i < 4; i++){
            await riceswap.punishProtcol(coin.target);
          }

          await coin.transfer(otherAccount.address, 20000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 20000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await expect(IOtherSwap.farm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "RCNProjectBlcoked");

      });


      
      it("Should unpunish", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          for(let i=0; i < 4; i++){
            await riceswap.punishProtcol(coin.target);
          }

          await coin.transfer(otherAccount.address, 20000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 20000000000000000000n);


          const IOtherSwap = riceswap.connect(otherAccount);
          await expect(IOtherSwap.farm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "RCNProjectBlcoked");

          await riceswap.unPunishProtocol(coin.target);
          await IOtherSwap.farm(coin.target, 10000000000000000000n);

          expect(await riceswap._farming(coin.target, otherAccount.address)).to.equal(10000000000000000000n);

      });


      it("Should punish (NOT ADMIN)", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          const other = riceswap.connect(otherAccount);
          for(let i=0; i < 4; i++){
            await expect(other.punishProtcol(coin.target)).to.be.revertedWith("ADMIN");
          }
      });

      
      it("Should delete", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          for(let i=0; i < 4; i++){
            await riceswap.punishProtcol(coin.target);
          }

          await coin.transfer(otherAccount.address, 20000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 20000000000000000000n);

          const IOtherSwap = riceswap.connect(otherAccount);
          await expect(IOtherSwap.farm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "RCNProjectBlcoked");

          await riceswap.deleteProtocol(coin.target);

          const RES = await riceswap.verifyPool(coin.target);

          console.log(RES);
      });


      it("Should delete (NOT PERMISSION)", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
          await coin.approve(riceswap.target,100_000_0000000000000000000n);
          await usdt.approve(riceswap.target, 10000000000000000000n)
          await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

          for(let i=0; i < 4; i++){
            await riceswap.punishProtcol(coin.target);
          }

          await coin.transfer(otherAccount.address, 20000000000000000000n)
          const IOther = coin.connect(otherAccount);
          await IOther.approve(riceswap.target, 20000000000000000000n);

          const IOtherSwap = riceswap.connect(otherAccount);
          await expect(IOtherSwap.farm(coin.target, 10000000000000000000n)).to.be.revertedWithCustomError(riceswap, "RCNProjectBlcoked");

          await expect(IOtherSwap.deleteProtocol(coin.target)).to.be.revertedWith("ADMIN")
      });



      it("Should safetransfer", async function () {
        const { riceswap, coin, usdt, owner} = await loadFixture(deployFixture);
        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await riceswap.pause();
        await riceswap.safeTransfer(coin.target);

        const ADMIN = await riceswap.verifyPool(coin.target);

        expect(await usdt.balanceOf(owner.address)).to.equal(1360450000000000000000000000n)
      });


      it("Should safetransfer not permission", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await riceswap.pause();

        const IOther = riceswap.connect(otherAccount);
        await expect(IOther.safeTransfer(coin.target)).to.be.revertedWith("UNAUTHORIZED");

      });



      it("Should pausable", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await riceswap.pause();

       expect(await riceswap.state()).to.equal(true)
       await coin.approve(riceswap.target,100_000_0000000000000000000n);
       await usdt.approve(riceswap.target,100_000_0000000000000000000n)
       await expect(riceswap.createPool(usdt.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)).to.be.revertedWithCustomError(riceswap, "RCNPlataformPausable")

      });


      it("Should pausable not permission", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        const Other = riceswap.connect(otherAccount);
        await expect(Other.pause()).to.be.revertedWithCustomError(riceswap, "OwnableUnauthorizedAccount");

      });


      it("Should unpause", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n)
        await riceswap.createPool(coin.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)

        await riceswap.pause();

       expect(await riceswap.state()).to.equal(true)
       await coin.approve(riceswap.target,100_000_0000000000000000000n);
       await usdt.approve(riceswap.target,100_000_0000000000000000000n)
       await expect(riceswap.createPool(usdt.target, usdt.target,100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100)).to.be.revertedWithCustomError(riceswap, "RCNPlataformPausable")


       await riceswap.unpause();
       await time.increase(30 *24 *60 *60);
      
       await coin.transfer(otherAccount.address, 10000000000000000000n)
       const IOther = coin.connect(otherAccount);
       await IOther.approve(riceswap.target, 10000000000000000000n);


       const IOtherSwap = riceswap.connect(otherAccount);
       await IOtherSwap.farm(coin.target, 10000000000000000000n);

       expect(await IOtherSwap._farming(coin.target, otherAccount)).to.equal(10000000000000000000n)

      });

      it("Should trasnferAdmin (zeroaddress)", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        await expect(riceswap.transferOwnership(ZeroAddress)).to.be.revertedWithCustomError(riceswap, "OwnableInvalidOwner")

      });

      it("Should trasnferAdmin (not permission)", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        const Other = riceswap.connect(otherAccount);
        await expect(Other.transferOwnership(ZeroAddress)).to.be.revertedWithCustomError(riceswap, "OwnableUnauthorizedAccount")

      });

      it("Should trasnferAdmin ", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        expect(await riceswap.transferOwnership(otherAccount));

        const Other = riceswap.connect(otherAccount);
        expect(await Other.updateFee(2));
        expect(await Other.viewFee()).to.equal(2);

      });

      
      it("Should trasnferAdmin (zeroaddress)", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);
        await expect(riceswap.transferAdmin(ZeroAddress)).to.be.revertedWithCustomError(riceswap, "AdminInvalidAddress")

      });

       
      it("Should update income and index", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n);
        await riceswap.createPool(coin.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100);

        await riceswap.updateIncome(coin.target, 12);
        await riceswap.updateIndex(coin.target, 1000)

        expect((await riceswap.pools(coin.target)).fee).to.equal(12);
        expect((await riceswap.pools(coin.target)).index).to.equal(1000);
      });

      it("Should update income and index (NOT PERMISSION)", async function () {
        const { riceswap, otherAccount, coin, usdt} = await loadFixture(deployFixture);

        await coin.approve(riceswap.target,100_000_0000000000000000000n);
        await usdt.approve(riceswap.target, 10000000000000000000n);
        await riceswap.createPool(coin.target, usdt.target, 100_000_0000000000000000000n, 10000000000000000000n, TIME, 1n, 100);

        const OTHER = riceswap.connect(otherAccount);
        await expect(OTHER.updateIncome(coin.target, 12)).to.be.revertedWith("UNAUTHORIZED");
        await expect(OTHER.updateIndex(coin.target, 1000)).to.be.revertedWith("UNAUTHORIZED")

       
      });
          
    });
  });
 