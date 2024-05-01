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
    const RANGE = 10000_000_000_000_000_000_000n
     async function deployFixture() {
       const [owner, otherAccount, account2, account3] = await ethers.getSigners();

         const RiceCoin = await ethers.getContractFactory("RiceCoin");
         const ricecoin = await RiceCoin.deploy();

         const Usdt = await ethers.getContractFactory("Usdt");
         const usdt = await Usdt.deploy();

         const Factory = await ethers.getContractFactory("RiceswapV1Factory");
         const factory = await Factory.deploy();

         const PreSale = await ethers.getContractFactory("RiceswapV1Saller");
         const preSale = await PreSale.deploy(account2, 10000_000_000_000_000_000_000n, 1n, ricecoin.target, usdt.target, factory.target);

         const Router = await ethers.getContractFactory("SallerV1Router");
         const router = await Router.deploy();

       return {ricecoin, usdt, factory, preSale, router, otherAccount, account2, account3};
     }

     describe("Deployment", function () {
       it("Should deposit", async function () {
         const {preSale, ricecoin} = await loadFixture(deployFixture);
         await ricecoin.approve(preSale.target, RANGE);
         await preSale.deposit(RANGE)

         expect(await preSale.limitMarking(ricecoin.target)).to.equal(RANGE);
         expect(await ricecoin.balanceOf(preSale.target)).to.equal(RANGE);
       });   

       it("Should deposit amount <= 0", async function () {
        const {preSale, ricecoin} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await expect(preSale.deposit(0n)).to.be.revertedWithCustomError(preSale, "IRiceswapAmount")
      });  

      it("Should deposit amount > range", async function () {
        const {preSale, ricecoin} = await loadFixture(deployFixture);
        const newRange = 100000_000000000000000000n;
        await ricecoin.approve(preSale.target, newRange);
        await expect(preSale.deposit(newRange)).to.be.revertedWithCustomError(preSale, "IRiceswapMaximumRange")
      });

      it("Should buy", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, AMOUNT);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, AMOUNT);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, AMOUNT);

        expect(await preSale._claim(otherAccount.address)).to.equal(AMOUNT);
        expect(await preSale.limitMarking(ricecoin.target)).to.equal(RANGE - AMOUNT);
        
      }); 

      it("Should buy amount <= 0", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, AMOUNT);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, AMOUNT);
  
        const IOther = preSale.connect(otherAccount);
        await expect(IOther.buy(otherAccount, 0n)).to.be.revertedWithCustomError(preSale, "IRiceswapAmount");
        
      });

      it("Should buy amount <= 0", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, AMOUNT);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, AMOUNT);
  
        const IOther = preSale.connect(otherAccount);
        await expect(IOther.buy(otherAccount, 0n)).to.be.revertedWithCustomError(preSale, "IRiceswapAmount");
        
      }); 

      it("Should buy !lockpresale ", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, RANGE);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, RANGE);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, RANGE)

        await usdt.transfer(otherAccount, AMOUNT);
        await other.approve(preSale.target, AMOUNT);
  
        await expect(IOther.buy(otherAccount, AMOUNT)).to.be.revertedWithCustomError(preSale, "IRiceswapPreSaleFinished")
        
      }); 

      it("Should refund", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, AMOUNT);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, AMOUNT);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, AMOUNT);

        expect(await preSale.limitMarking(ricecoin.target)).to.equal(RANGE - AMOUNT);
        expect(await usdt.balanceOf(preSale.target)).to.equal(AMOUNT)
        expect(await usdt.balanceOf(otherAccount.address)).to.equal(0n);

        await IOther.refund(otherAccount, AMOUNT);

        expect(await preSale._claim(otherAccount.address)).to.equal(0n);
        expect(await preSale.limitMarking(ricecoin.target)).to.equal(RANGE);
        expect(await usdt.balanceOf(otherAccount.address)).to.equal(AMOUNT);
        expect(await usdt.balanceOf(preSale.target)).to.equal(0n)
        
        
      }); 

      it("Should refund amount <= 0", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, AMOUNT);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, AMOUNT);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, AMOUNT);

        await expect(IOther.refund(otherAccount, 0n)).to.be.revertedWithCustomError(preSale, "IRiceswapAmount");

      }); 

      it("Should refund claim < amount", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, AMOUNT);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, AMOUNT);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, AMOUNT);

        await expect(IOther.refund(otherAccount, RANGE)).to.be.revertedWithCustomError(preSale, "IRiceswapInvalidRefund");

      });
      
      it("Should refund claim lockpresale", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, RANGE);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, RANGE);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, RANGE);

        await expect(IOther.refund(otherAccount, AMOUNT)).to.be.revertedWithCustomError(preSale, "IRiceswapPreSaleFinished");

      }); 

      it("Should claim ", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, RANGE);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, RANGE);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, RANGE)
 
        await IOther.claim(otherAccount);
        
        expect(await ricecoin.balanceOf(otherAccount.address)).to.equal(RANGE);
      }); 

      it("Should claim !estimaterange ", async function () {
        const {preSale, ricecoin, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, RANGE);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, RANGE);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, AMOUNT)
 
        await expect(IOther.claim(otherAccount)).to.be.revertedWithCustomError(preSale, "IRiceswapPreSaleNotFinished");
        
      });


      it("Should withdraw", async function () {
        const {preSale, ricecoin, otherAccount, usdt, account2, factory} = await loadFixture(deployFixture);
        await ricecoin.approve(preSale.target, RANGE);
        await preSale.deposit(RANGE)


        await usdt.transfer(otherAccount, RANGE);
        const other = usdt.connect(otherAccount);
        await other.approve(preSale.target, RANGE);
  
        const IOther = preSale.connect(otherAccount);
        await IOther.buy(otherAccount, RANGE);

        const IAdmin = preSale.connect(account2);
        await IAdmin.withdraw();

        expect(await usdt.balanceOf(account2)).to.equal(9500000000000000000000n);
        expect(await usdt.balanceOf(factory.target)).to.equal(500000000000000000000n)
       

      });
      
      

     //--------------------------------------------------------------------------------------- ROUTER -----------------------------------------------------------------------------------------------------

     it("Should presale deposit ", async function () {
      const {preSale, ricecoin, router, otherAccount} = await loadFixture(deployFixture);
      await ricecoin.transfer(otherAccount, RANGE);
      const other = ricecoin.connect(otherAccount);
      await other.approve(router, RANGE);

      const IOther = router.connect(otherAccount);

      await IOther.callbackDeposit(preSale.target, RANGE);

      expect(await ricecoin.balanceOf(preSale)).to.equal(RANGE);



    });
    
    });
});