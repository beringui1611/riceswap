  import {
    loadFixture,
    time,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import { ethers } from "hardhat";

  describe("RiceCoin", function () {
    const VALUE = 1_000_000_000_000_000_000n;
    const TIME = 30 *24 *60 *60;
    async function deployFixture() {
      const [owner, otherAccount, account2, account3] = await ethers.getSigners();

       const Riceswap = await ethers.getContractFactory("RiceswapV1Factory");
       const riceswap = await Riceswap.deploy();

       const RiceCoin = await ethers.getContractFactory("RiceCoin");
       const ricecoin = await RiceCoin.deploy();

       const USDT = await ethers.getContractFactory("Usdt");
       const usdt = await USDT.deploy();

       const Pool = await ethers.getContractFactory("RiceswapTest20V1Pool");
       const pool = await Pool.deploy(riceswap.target, ricecoin.target, usdt.target, account2.address, TIME, 1n, 100n)

       const Router = await ethers.getContractFactory("RiceswapRouter");
       const router = await Router.deploy();


      return { ricecoin, owner, otherAccount, account2, account3, pool, router, usdt};
    }

    describe("Deployment", function () {
      it("Should router farm", async function () {
        const { ricecoin, router, pool, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount.address, VALUE);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(router.target, VALUE);

        const IOtherRouter = router.connect(otherAccount);

        const tx = await IOtherRouter.CallBackFarm(pool.target, ricecoin.target, VALUE);
        const txUsed = await tx.wait()
        console.log(txUsed?.gasUsed);
        expect(await pool.farming(otherAccount.address)).to.equal(VALUE);
      });

      it("Should router removefarm", async function () {
        const { ricecoin, router, pool, otherAccount} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount.address, VALUE);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(router.target, VALUE);

        const IOtherRouter = router.connect(otherAccount);

        await IOtherRouter.CallBackFarm(pool.target, ricecoin.target, VALUE);
        expect(await pool.farming(otherAccount.address)).to.equal(VALUE);

        await time.increase(TIME);

        const tx =  await IOtherRouter.CallBackRemoveFarm(pool.target, VALUE);
        const txUsed = await tx.wait();
        console.log(txUsed?.gasUsed);
        expect(await pool.farming(otherAccount.address)).to.equal(0n);
        expect(await ricecoin.balanceOf(otherAccount.address)).to.equal(VALUE);

      });

      it("Should router payholders", async function () {
        const { ricecoin, router, pool, otherAccount, usdt} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount.address, VALUE);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(router.target, VALUE);

        const IOtherRouter = router.connect(otherAccount);

        await IOtherRouter.CallBackFarm(pool.target, ricecoin.target, VALUE);
        expect(await pool.farming(otherAccount.address)).to.equal(VALUE);

        await usdt.approve(pool.target, VALUE);
        await pool.deposit(VALUE);

        await time.increase(TIME);

        const tx =  await IOtherRouter.CallBackPayholders(pool.target);
        const txUsed = await tx.wait();
        console.log(txUsed?.gasUsed);

        expect(await usdt.balanceOf(otherAccount.address)).to.equal(9500000000000000n)
      });

      it("Should router validators", async function () {
        const { ricecoin, router, pool, otherAccount, usdt, account3} = await loadFixture(deployFixture);
        await ricecoin.transfer(otherAccount.address, VALUE);
        const IOther = ricecoin.connect(otherAccount);
        await IOther.approve(router.target, VALUE);

        const IOtherRouter = router.connect(otherAccount);

        await IOtherRouter.CallBackFarm(pool.target, ricecoin.target, VALUE);
        expect(await pool.farming(otherAccount.address)).to.equal(VALUE);

        await usdt.approve(pool.target, VALUE);
        await pool.deposit(VALUE);

        await time.increase(TIME);

        const addressTwo = router.connect(account3);
        const tx =  await addressTwo.CallBackValidator(pool.target, otherAccount);
        const txUsed = await tx.wait();
        console.log(txUsed?.gasUsed);

        expect(await usdt.balanceOf(otherAccount.address)).to.equal(8500000000000000n)
        expect(await usdt.balanceOf(account3.address)).to.equal(1000000000000000n)
      });
    });
});
