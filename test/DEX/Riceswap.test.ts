 import {
     loadFixture,
     time,
   } from "@nomicfoundation/hardhat-toolbox/network-helpers";
   import { expect } from "chai";
import { Wallet, ZeroAddress } from "ethers";
   import { ethers } from "hardhat";
 
   describe("RiceCoin", function () {
    const TIME = 30 *24 *60 *60;
    const AMOUNT = 1000_000_000_000_000_000_000n;
     async function deployFixture() {
       const [owner, otherAccount, account2, account3, account4, account5] = await ethers.getSigners();

       const Wallet = await ethers.getContractFactory("RiceswapWallet");
       const wallet = await Wallet.deploy();
 
       const Riceswap = await ethers.getContractFactory("RiceswapV1Factory");
       const riceswap = await Riceswap.deploy(wallet.target);

       const RiceCoin = await ethers.getContractFactory("RiceCoin");
       const ricecoin = await RiceCoin.deploy();

       const USDT = await ethers.getContractFactory("Usdt");
       const usdt = await USDT.deploy();

       const Pool = await ethers.getContractFactory("Riceswap20V1Pool");
       const pool = await Pool.deploy(riceswap.target, ricecoin.target, usdt.target, account2.address, wallet.target, TIME, 1n, 100n)

       
       const Pool40 = await ethers.getContractFactory("Riceswap40V1Pool");
       const pool40 = await Pool40.deploy(riceswap.target, ricecoin.target, usdt.target, account2.address, wallet.target, TIME, 1n, 100n)

       const RiceswapRouter = await ethers.getContractFactory("RiceswapV1Router");
       const riceswapRouter = await RiceswapRouter.deploy();
         
 
       return {riceswap, ricecoin, pool, usdt, owner, otherAccount, account2, account3, pool40, riceswapRouter, account4, account5, wallet};
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

      it("Should createPool token0 == token0", async function () {
        const { riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
        await riceswap.createPool(ricecoin.target, usdt.target, 1n, 100n)
        await expect(riceswap.createPool(ricecoin.target, usdt.target, 1n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapAddressDifferentToken0")

      }); 

      it("Should createPool 40", async function () {
          const { riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
          const tx =  await riceswap.createPool40(ricecoin.target, usdt.target, 1n, 100n)
          const txUsed = await tx.wait();
          console.log(`createPool gas used: ${txUsed?.gasUsed}`)
 
          const pool = await riceswap.getPool(ricecoin.target);
          console.log(pool);
          
        }); 
 
 
        it("Should createPool40 token0 == address(0) (ERROR)", async function () {
         const {riceswap, usdt} = await loadFixture(deployFixture);
         await expect(riceswap.createPool40(ZeroAddress, usdt.target, 1n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapAddressZero");        
       }); 
 
 
       it("Should createPool40 token1 == address(0) (ERROR)", async function () {
         const {riceswap, ricecoin} = await loadFixture(deployFixture);
         await expect(riceswap.createPool40(ricecoin.target, ZeroAddress, 1n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapAddressZero");
       });
 
 
       it("Should createPool40 fee == 0 (ERROR)", async function () {
         const {riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
         await expect(riceswap.createPool40(ricecoin.target, usdt.target , 0n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapPercentInvalid");
       });
 
 
       it("Should createPool40 index == 0 (ERROR)", async function () {
         const {riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
         await expect(riceswap.createPool40(ricecoin.target, usdt.target , 1n, 0n)).to.be.revertedWithCustomError(riceswap, "IRiceswapIndexInvalid");
       });
 
       it("Should createPool40 token0 == token0", async function () {
         const { riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
         await riceswap.createPool40(ricecoin.target, usdt.target, 1n, 100n)
         await expect(riceswap.createPool40(ricecoin.target, usdt.target, 1n, 100n)).to.be.revertedWithCustomError(riceswap, "IRiceswapAddressDifferentToken0")
 
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

// ----------------------------------------- POOL ----------------------------------------------------------
      it("Should farm (POOL)", async function () {
        const {pool, ricecoin, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);
        const tx = await IOtherPool.farm(otherAccount, AMOUNT);
        const txUsed = await tx.wait();
        console.log(`farm gas used: ${txUsed?.gasUsed}`)

        expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
        expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);
      });


      it("Should farm balance < amount (POOL)", async function () {
        const {pool, otherAccount} = await loadFixture(deployFixture);
        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(otherAccount, AMOUNT)).to.be.revertedWithCustomError(pool, "RiceswapBalanceInsufficient");
        
      });


      it("Should farm erorr NO DELEGATE (POOL)", async function () {
        const {pool, ricecoin, otherAccount, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(account3, AMOUNT)).to.be.revertedWith("NO DELEGATE");
        
      });


      it("Should farm allowance < amount (POOL)", async function () {
        const {pool, ricecoin, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, 1000n);

        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(otherAccount, AMOUNT)).to.be.revertedWithCustomError(pool, "RiceswapAllowanceInsufficient");
       
      });

      it("Should farm amount <= 0 (POOL)", async function () {
        const {pool, otherAccount} = await loadFixture(deployFixture);
      
        const IOtherPool = pool.connect(otherAccount);
        await expect(IOtherPool.farm(otherAccount, 0n)).to.be.revertedWithCustomError(pool, "RiceswapAmountInsufficient");
       
      });


      it("Should removeFarm (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
        
        await time.increase(30 *24 *60 *60);
        
      
        const tx = await IOtherPool.removeFarm(otherAccount, AMOUNT);
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
        await IOtherPool.farm(otherAccount, AMOUNT);

        await time.increase(29 *24 *60 *60);
        
        await expect(IOtherPool.removeFarm(otherAccount, AMOUNT)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");
           
      });

      it("Should removeFarm farming == 0 (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);

        await time.increase(39 *24 *60 *60);
        
        await expect(IOtherPool.removeFarm(otherAccount, AMOUNT)).to.be.revertedWithCustomError(pool, "IRiceswapInsufficientFarming");
           
      });

      it("Should removeFarm amount <= 0 (POOL)", async function () {
        const {pool, ricecoin,  otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        const IOtherPool = pool.connect(otherAccount);

        await time.increase(39 *24 *60 *60);
        
        await expect(IOtherPool.removeFarm(otherAccount, 0)).to.be.revertedWithCustomError(pool, "RiceswapAmountInsufficient");
           
      });


      it("Should payholders (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
       
        await time.increase(30 *24 *60 *60);

        const tx = await IOtherPool.payholders(otherAccount.address);
        const txUsed = await tx.wait();
        console.log(`payholders gas used: ${txUsed?.gasUsed}`)
       
        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet.target)).to.equal(500000000000000000n);
        expect(await pool.liquidity(pool.target)).to.equal(990000000000000000000n);
      });

      it("Should payholders 2 months (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
       
        await time.increase(60 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);
       
        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n *2n);
        expect(await usdt.balanceOf(wallet.target)).to.equal(1000000000000000000n);
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

        await expect(IOtherPool.payholders(otherAccount)).to.be.revertedWithCustomError(pool, "IRiceswapInsufficientFarming");
       
      });

      it("Should payholders time < 30days (POOL)", async function () {
        const {pool, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
       
        await time.increase(29 *24 *60 *60);

        await expect(IOtherPool.payholders(otherAccount)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");
       
      });

      it("Should payholders liquidity < txMonth (POOL)", async function () {
        const {pool, ricecoin, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);
      

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
       
        await time.increase(30 *24 *60 *60);

        await expect(IOtherPool.payholders(otherAccount)).to.be.revertedWithCustomError(pool, "IRiceswapLiquidityInsufficient");
      });
      
      it("Should validator ", async function () {
        const {pool, ricecoin, otherAccount, usdt, wallet, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
       
        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        const tx = await IOtherValidator.validator(otherAccount.address, account3);
        const txUsed = await tx.wait();
        console.log(`validator gas used: ${txUsed?.gasUsed}`)

        expect(await usdt.balanceOf(otherAccount.address)).to.equal(8500000000000000000n);
        expect(await usdt.balanceOf(account3.address)).to.equal(1000000000000000000n);
        expect(await usdt.balanceOf(wallet.target)).to.equal(500000000000000000n);
        expect(await usdt.balanceOf(pool.target)).to.equal(990000000000000000000n);

      });

      it("Should validator farming <= 0", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        
       
        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await expect(IOtherValidator.validator(otherAccount.address, account3)).to.be.revertedWithCustomError(pool, "IRiceswapInsufficientFarming");
      });

      it("Should validator time < 30days", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);

        await time.increase(29 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await expect(IOtherValidator.validator(otherAccount.address, account3)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");
      });

      it("Should validator time liquidity < txMonth", async function () {
        const {pool, ricecoin, otherAccount, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);
    

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);

        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await expect(IOtherValidator.validator(otherAccount.address, account3)).to.be.revertedWithCustomError(pool, "IRiceswapLiquidityInsufficient");
      });

      it("Should validator > sequence time not expired ", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        

        const IOtherPool = pool.connect(otherAccount);
        await IOtherPool.farm(otherAccount, AMOUNT);
       
        await time.increase(30 *24 *60 *60);     
        
        const IOtherValidator = pool.connect(account3);
        await IOtherValidator.validator(otherAccount.address, account3);

        await expect(IOtherValidator.validator(otherAccount, account3)).to.be.revertedWithCustomError(pool, "IRiceswapTimeNotExpired");

      });

      it("Should deposit (POOL) ", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await pool.deposit(AMOUNT);
        
      });

      it("Should deposit amount <= 0 (POOL) ", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool.target, AMOUNT);

        await usdt.approve(pool.target, AMOUNT);
        await expect(pool.deposit(0n)).to.be.revertedWithCustomError(pool, "RiceswapAmountInsufficient");
        
      });

      it("Should deposit amount <= 0 (POOL) ", async function () {
        const {pool, ricecoin, otherAccount, usdt, account3, account2} = await loadFixture(deployFixture);
        expect(await pool.owner()).to.equal(account2)
        const IAdmin = pool.connect(account2);

        await IAdmin.transferOwnership(account3);
        expect(await pool.owner()).to.equal(account3);        
      });

      // ---------------------------------- RCN40 -----------------------------------------------------

      it("Should createPool RCN40 (variable fee)", async function () {
        const { riceswap, ricecoin, usdt} = await loadFixture(deployFixture);
        const tx =  await riceswap.createPool40(ricecoin.target, usdt.target, 1n, 100n)
        const txUsed = await tx.wait();
        console.log(`createPool gas used: ${txUsed?.gasUsed}`)

        const pool = await riceswap.getPool(ricecoin.target);
        console.log(pool);
        
      });

      it("Should payholders (POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet.target)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await IAccount.upgradeableFee(2)

        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(28500000000000000000n);
        expect(await usdt.balanceOf(wallet.target)).to.equal(1500000000000000000n);

      });

      it("Should payholders upgradeable fee(POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await IAccount.upgradeableFee(2)

        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(28500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(1500000000000000000n);

      });

      it("Should payholders upgradeable fee owner( ERROR POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await expect(pool40.upgradeableFee(2)).to.revertedWith("A")

      });

      it("Should payholders upgradeable fee 0 ( ERROR POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await expect(IAccount.upgradeableFee(0)).to.revertedWith("0")

      });

      it("Should payholders upgradeable index (POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await IAccount.upgradeableIndex(1000)

        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(10450000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(550000000000000000n);

      });

      it("Should payholders upgradeable index owner ( ERROR POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2 , wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await expect(pool40.upgradeableIndex(100)).to.revertedWith("A")

      });

      it("Should payholders upgradeable index 0 ( ERROR POOL40)", async function () {
        const {pool40, ricecoin, otherAccount, usdt, account2, wallet} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount, AMOUNT);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(pool40.target, AMOUNT);

        await usdt.approve(pool40.target, AMOUNT);
        await pool40.deposit(AMOUNT);
        

        const IOtherPool = pool40.connect(otherAccount);
        await IOtherPool.farm(AMOUNT, otherAccount);
       
        await time.increase(30 *24 *60 *60);

        await IOtherPool.payholders(otherAccount);

        expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
        expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);

        const IAccount = pool40.connect(account2);

        await expect(IAccount.upgradeableIndex(0)).to.revertedWith("0")

      });

      // ------------------------------------------ END LINES -------------------------------------------------------
      
      // ------------------------------------------ ROUTERS ---------------------------------------------------------

      it("Should riceswap router farm", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin } = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherPool = riceswapRouter.connect(otherAccount);
          const tx = await IOtherPool.callbackFarm(pool.target, AMOUNT);
          const txUsed = await tx.wait();
          console.log(`router farm: ${txUsed?.gasUsed}`);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

      });

      it("Should riceswap router removefarm", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin } = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          await IOtherRouter.callbackFarm(pool.target, AMOUNT);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

          await time.increase(TIME);

          const tx = await IOtherRouter.callbackRemoveFarm(pool.target, AMOUNT);
          const txUsed = await tx.wait();
          console.log(`router removefarm: ${txUsed?.gasUsed}`);

          expect(await ricecoin.balanceOf(otherAccount)).to.equal(AMOUNT);
          expect(await pool.farming(otherAccount)).to.equal(0n);

      });


      it("Should riceswap router payholders", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin, usdt, account2, wallet} = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          await IOtherRouter.callbackFarm(pool.target, AMOUNT);

          await usdt.approve(pool, AMOUNT);
          await pool.deposit(AMOUNT);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

          await time.increase(TIME);

          const tx = await IOtherRouter.callbackPayholders(pool.target);
          const txUsed = await tx.wait();
          console.log(`router payholders: ${txUsed?.gasUsed}`);

          expect(await usdt.balanceOf(otherAccount)).to.equal(9500000000000000000n);
          expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);
         
      });

      it("Should riceswap router validators", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin, usdt, account2, account3, wallet} = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          await IOtherRouter.callbackFarm(pool.target, AMOUNT);

          await usdt.approve(pool, AMOUNT);
          await pool.deposit(AMOUNT);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

          await time.increase(TIME);

          const IOtherValidator = riceswapRouter.connect(account3);

          const tx = await IOtherValidator.callbackValidator(pool.target, otherAccount);
          const txUsed = await tx.wait();
          console.log(`router validator: ${txUsed?.gasUsed}`);

          expect(await usdt.balanceOf(otherAccount)).to.equal(8500000000000000000n);
          expect(await usdt.balanceOf(wallet)).to.equal(500000000000000000n);
          expect(await usdt.balanceOf(account3)).to.equal(1000000000000000000n);
         
      });

      it("Should riceswap router deposit", async function () {
        const {pool, riceswapRouter, otherAccount, usdt} = await loadFixture(deployFixture);
          
          await usdt.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = usdt.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          const tx = await IOtherRouter.callbackDeposit(pool, AMOUNT);
          const txUsed = await tx.wait();
          console.log(`router deposit: ${txUsed?.gasUsed}`)

          expect(await usdt.balanceOf(pool.target)).to.equal(AMOUNT);
          expect(await pool.liquidity(pool.target)).to.equal(AMOUNT);
      });

      // --------------------------------------- ERRORS ROUTER ------------------------------------------------------

      it("Should riceswap router farm error ", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin } = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherPool = riceswapRouter.connect(otherAccount);
          await expect(IOtherPool.callbackFarm(pool, 0)).to.be.revertedWithCustomError(riceswapRouter, "IRiceswapAmount");
      });

      it("Should riceswap router removefarm error", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin } = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          await IOtherRouter.callbackFarm(pool.target, AMOUNT);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

          await time.increase(TIME);

          await expect(IOtherRouter.callbackRemoveFarm(pool, 0)).to.be.revertedWithCustomError(riceswapRouter, "IRiceswapAmount");

      });

      it("Should riceswap router payholders error", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin, usdt, account2} = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          await IOtherRouter.callbackFarm(pool.target, AMOUNT);

          await usdt.approve(pool, AMOUNT);
          await pool.deposit(AMOUNT);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

          await time.increase(TIME);

          await expect(IOtherRouter.callbackPayholders(ZeroAddress)).to.be.revertedWithCustomError(riceswapRouter, "IRiceswapAddressZero");
      });


      it("Should riceswap router validators errors", async function () {
        const {pool, riceswapRouter, otherAccount, ricecoin, usdt, account2, account3} = await loadFixture(deployFixture);
          
          await ricecoin.transfer(otherAccount.address, AMOUNT);
          const IOtherApprove = ricecoin.connect(otherAccount);
          await IOtherApprove.approve(riceswapRouter, AMOUNT);

          const IOtherRouter = riceswapRouter.connect(otherAccount);
          await IOtherRouter.callbackFarm(pool.target, AMOUNT);

          await usdt.approve(pool, AMOUNT);
          await pool.deposit(AMOUNT);

          expect(await pool.farming(otherAccount.address)).to.equal(AMOUNT);
          expect(await ricecoin.balanceOf(pool.target)).to.equal(AMOUNT);

          await time.increase(TIME);

          const IOtherValidator = riceswapRouter.connect(account3);

          await expect(IOtherValidator.callbackValidator(ZeroAddress, otherAccount)).to.be.revertedWithCustomError(riceswapRouter, "IRiceswapAddressZero");
          await expect(IOtherValidator.callbackValidator(pool.target, ZeroAddress)).to.be.revertedWithCustomError(riceswapRouter, "IRiceswapAddressZero");
      });
      
      it("Should riceswap router deposit errors", async function () {
        const {pool, riceswapRouter, otherAccount, usdt} = await loadFixture(deployFixture);
              
        await usdt.transfer(otherAccount.address, AMOUNT);
        const IOtherApprove = usdt.connect(otherAccount);
        await IOtherApprove.approve(riceswapRouter, AMOUNT);

        const IOtherRouter = riceswapRouter.connect(otherAccount);
        await expect(IOtherRouter.callbackDeposit(pool, 0n)).to.be.revertedWithCustomError(riceswapRouter, "IRiceswapAmount");          
      });

      it("GET ADDRESSES", async function () {
        const {owner, otherAccount, account2, account3, account4, account5} = await loadFixture(deployFixture);
          
        console.log(`address owner: ${owner.address}`);
        console.log(`address other: ${otherAccount.address}`);
        console.log(`address admin: ${account2.address}`);
        console.log(`address dev: ${account3.address}`);
        console.log(`address marketing: ${account4.address}`);
        console.log(`address donations: ${account5.address}`);

        /*
        address owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        address other: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        address admin: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
        address dev: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
        address marketing: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
        address donations: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
        */
        
      });

     });
   }); 
 