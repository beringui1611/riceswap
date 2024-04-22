 import {
     loadFixture,
     time,
   } from "@nomicfoundation/hardhat-toolbox/network-helpers";
   import { expect } from "chai";
import { ZeroAddress } from "ethers";
   import { ethers } from "hardhat";
 
   describe("RiceCoin", function () {
    const TIME = 30 *24 *60 *60;
    const AMOUNT = 1000_000_000_000_000_000_000n;
     async function deployFixture() {
       const [owner, otherAccount, account2, account3] = await ethers.getSigners();
 
       const Riceswap = await ethers.getContractFactory("RiceswapV1Factory");
       const riceswap = await Riceswap.deploy();

       const RiceCoin = await ethers.getContractFactory("RiceCoin");
       const ricecoin = await RiceCoin.deploy();

       const USDT = await ethers.getContractFactory("Usdt");
       const usdt = await USDT.deploy();

       const Pool = await ethers.getContractFactory("RiceswapV1Pool");
       const pool = await Pool.deploy(riceswap.target, ricecoin.target, usdt.target, account2.address, TIME, 1n, 100n, 5n)
         
 
       return {riceswap, ricecoin, pool, usdt, owner, otherAccount, account2, account3};
     }
 
     describe("Deployment", function () {
       it("Should createPool", async function () {
         const { riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
         const tx =  await riceswap.createPool(ricecoin.target, usdt.target, 1n, 100n)
         const txUsed = await tx.wait();
         console.log(`createPool gas used: ${txUsed?.gasUsed}`)

         const pool = await riceswap.getPool(ricecoin.target);
         console.log(pool);
         
       }); 


       it("Should createPool token0 == address(0) (ERROR)", async function () {
        const {riceswap, usdt} = await loadFixture(deployFixture);
        await expect(riceswap.createPool(ZeroAddress, usdt.target, 1n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapAddressZero");        
      }); 


      it("Should createPool token1 == address(0) (ERROR)", async function () {
        const {riceswap, ricecoin} = await loadFixture(deployFixture);
        await expect(riceswap.createPool(ricecoin.target, ZeroAddress, 1n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapAddressZero");
      });


      it("Should createPool fee == 0 (ERROR)", async function () {
        const {riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
        await expect(riceswap.createPool(ricecoin.target, usdt.target , 0n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapPercentInvalid");
      });


      it("Should createPool index == 0 (ERROR)", async function () {
        const {riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
        await expect(riceswap.createPool(ricecoin.target, usdt.target , 1n, 0n)).to.be.revertedWithCustomError(riceswap, "IRiceswapIndexInvalid");
      });


      it("Should setOwner", async function () {
        const {riceswap, otherAccount} = await loadFixture(deployFixture);
        const tx = await riceswap.setOwner(otherAccount.address);
        const txUsed = await tx.wait();
        console.log(`setOwner gas used: ${txUsed?.gasUsed}`)

        expect(await riceswap.owner()).to.equal(otherAccount.address);
      });


      it("Should setOwner msg.sender == owner (error)", async function () {
        const {riceswap, otherAccount} = await loadFixture(deployFixture);
        const IOther = riceswap.connect(otherAccount);
        await expect(IOther.setOwner(otherAccount.address)).to.be.revertedWith("OWNER");
      });


      it("Should setFee", async function () {
        const {riceswap} = await loadFixture(deployFixture);
        const tx = await riceswap.setFee(10n);
        const txUsed = await tx.wait();
        console.log(`setFee gas used: ${txUsed?.gasUsed}`)

        expect(await riceswap.dexFee()).to.equal(10n);
      });


      it("Should setFee invalid (ONLY OWNER)", async function () {
        const {riceswap, otherAccount} = await loadFixture(deployFixture);
        const IOther = riceswap.connect(otherAccount);
        await expect(IOther.setFee(10n)).to.be.revertedWith("OWNER");
      });


      it("Should farm (POOL)", async function () {
        const {pool, ricecoin, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);
        const tx = await IOtherPool.farm(AMOUNT);
        const txUsed = await tx.wait();
        console.log(`farm gas used: ${txUsed?.gasUsed}`)

        expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
        expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);
      });


      it("Should farm balance < amount (POOL)", async function () {
        const {pool, otherAccount} = await loadFixture(deployFixture);
        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(AMOUNT)).to.be.revertedWithCustomError(pool, "RiceswapBalanceInsufficient");
        
      });


      it("Should farm allowance < amount (POOL)", async function () {
        const {pool, ricecoin, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, 1000n);

        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(AMOUNT)).to.be.revertedWithCustomError(pool, "RiceswapAllowanceInsufficient");
       
      });

      it("Should farm amount <= 0 (POOL)", async function () {
        const {pool, otherAccount} = await loadFixture(deployFixture);
      
        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(0n)).to.be.revertedWithCustomError(pool, "RiceswapAmountInsufficient");
       
      });


      it("Should removeFarm (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
        
        await time.increase(30 *24 *60 *60);
        
        const tx = await IOtherPool.removeFarm(AMOUNT);
        const txUsed = await tx.wait();
        console.log(`removefarm gas used: ${txUsed?.gasUsed}`)
        
        expect(await IOtherPool.farming(otherAccount.address)).to.equal(0n);
        expect(await ricecoin.balanceOf(otherAccount.address)).to.equal(AMOUNT);       
      });


      
      it("Should removeFarm block.timestamp < timer[msg.sender] (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);

        await time.increase(29 *24 *60 *60);
        
        await expect(IOtherPool.removeFarm(AMOUNT)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");
           
      });

      it("Should removeFarm farming == 0 (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);

        await time.increase(39 *24 *60 *60);
        
        await expect(IOtherPool.removeFarm(AMOUNT)).to.be.revertedWithCustomError(pool, "IRiceswapInsufficientFarming");
           
      });

      it("Should removeFarm amount <= 0 (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);

        await time.increase(39 *24 *60 *60);
        
        await expect(IOtherPool.removeFarm(0)).to.be.revertedWithCustomError(pool, "RiceswapAmountInsufficient");
           
      });


      it("Should payholders (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt, account2} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
       
        await time.increase(30 *24 *60 *60);

        const tx = await IOtherPool.payholders();
        const txUsed = await tx.wait();
        console.log(`payholders gas used: ${txUsed?.gasUsed}`)
       
        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(account2)).to.equal(500000000000000000n);
        expect(await pool.liquidity(pool.target)).to.equal(990000000000000000000n);
      });

      it("Should payholders 2 months (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt, account2} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
       
        await time.increase(60 *24 *60 *60);

        await IOtherPool.payholders();
       
        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n *2n);
        expect(await usdt.balanceOf(account2)).to.equal(1000000000000000000n);
        expect(await pool.liquidity(pool.target)).to.equal(980000000000000000000n );

      });

      it("Should payholders farming <= 0 (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await expect(IOtherPool.payholders()).to.be.revertedWithCustomError(pool, "IRiceswapInsufficientFarming");
       
      });

      it("Should payholders time < 30days (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
       
        await time.increase(29 *24 *60 *60);

        await expect(IOtherPool.payholders()).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");
       
      });

      it("Should payholders liquidity < txMonth (POOL)", async function () {
        const {pool, ricecoin, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);
      

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
       
        await time.increase(30 *24 *60 *60);

        await expect(IOtherPool.payholders()).to.be.revertedWithCustomError(pool, "IRiceswapLiquidityInsufficient");
      });
      
      it("Should validator ", async function () {
        const {pool, ricecoin, otherAccount, usdt, account2, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
       
        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        const tx = await IOtherValidator.validator(otherAccount.address);
        const txUsed = await tx.wait();
        console.log(`validator gas used: ${txUsed?.gasUsed}`)

        expect(await usdt.balanceOf(otherAccount.address)).to.equal(8500000000000000000n);
        expect(await usdt.balanceOf(account3.address)).to.equal(1000000000000000000n);
        expect(await usdt.balanceOf(account2.address)).to.equal(500000000000000000n);
        expect(await usdt.balanceOf(pool.target)).to.equal(990000000000000000000n);

      });

      it("Should validator farming <= 0", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
       
        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await expect(IOtherValidator.validator(otherAccount.address)).to.be.revertedWithCustomError(pool, "IRiceswapInsufficientFarming");
      });

      it("Should validator time < 30days", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);

        await time.increase(29 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await expect(IOtherValidator.validator(otherAccount.address)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");
      });

      it("Should validator time liquidity < txMonth", async function () {
        const {pool, ricecoin, otherAccount, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);
    

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);

        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await expect(IOtherValidator.validator(otherAccount.address)).to.be.revertedWithCustomError(pool, "IRiceswapLiquidityInsufficient");
      });

      it("Should validator > sequence time not expired ", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(AMOUNT);
       
        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await IOtherValidator.validator(otherAccount.address);

        await expect(IOtherValidator.validator(otherAccount)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");

      });
     });
   });
 