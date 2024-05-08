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
   const riceswap = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
   const next = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
   const marketing ="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
   const donations = "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
    async function deployFixture() {
      const [owner, otherAccount, account2, account3, account4, account5] = await ethers.getSigners();

        const Wallet = await ethers.getContractFactory("RiceswapWallet");
        const wallet = await Wallet.deploy();

        const RiceCoin = await ethers.getContractFactory("RiceCoin");
        const ricecoin = await RiceCoin.deploy();

        const Usdt = await ethers.getContractFactory("Usdt");
        const usdt = await Usdt.deploy();

      return {wallet, usdt, ricecoin, owner, otherAccount, account2, account3, account4, account5};
    }

    describe("Deployment", function () {
      it("Should receiver", async function () {
       const {wallet, usdt, ricecoin} = await loadFixture(deployFixture);
       await usdt.approve(wallet.target, RANGE);
       await wallet.receiver(RANGE, usdt.target);

       expect(await usdt.balanceOf(wallet.target)).to.equal(RANGE);
       expect(await wallet.balanceOf(riceswap, usdt.target)).to.equal(5000_000_000_000_000_000_000n)
       expect(await wallet.balanceOf(next, usdt.target)).to.equal(3000_000_000_000_000_000_000n)
       expect(await wallet.balanceOf(marketing, usdt.target)).to.equal(1000_000_000_000_000_000_000n)
       expect(await wallet.balanceOf(donations, usdt.target)).to.equal(1000_000_000_000_000_000_000n)

  });

  it("Should withdraw", async function () {
    const {wallet, usdt, account3} = await loadFixture(deployFixture);
    await usdt.approve(wallet.target, RANGE);
    await wallet.receiver(RANGE, usdt.target);

    expect(await usdt.balanceOf(wallet.target)).to.equal(RANGE);
    expect(await wallet.balanceOf(riceswap, usdt.target)).to.equal(5000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(next, usdt.target)).to.equal(3000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(marketing, usdt.target)).to.equal(1000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(donations, usdt.target)).to.equal(1000_000_000_000_000_000_000n)

    const INext = wallet.connect(account3);
    await INext.withdraw(usdt.target, 3000_000_000_000_000_000_000n);

    expect(await usdt.balanceOf(account3)).to.equal(3000_000_000_000_000_000_000n);
  });

  it("Should withdraw <= amount", async function () {
    const {wallet, usdt, account3} = await loadFixture(deployFixture);
    await usdt.approve(wallet.target, RANGE);
    await wallet.receiver(RANGE, usdt.target);

    expect(await usdt.balanceOf(wallet.target)).to.equal(RANGE);
    expect(await wallet.balanceOf(riceswap, usdt.target)).to.equal(5000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(next, usdt.target)).to.equal(3000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(marketing, usdt.target)).to.equal(1000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(donations, usdt.target)).to.equal(1000_000_000_000_000_000_000n)

    const INext = wallet.connect(account3);
    await expect(INext.withdraw(usdt.target, 0n)).to.be.revertedWithCustomError(wallet, "RiceswapAmountInvalid");

   
  });

  it("Should withdraw address == 0x0000", async function () {
    const {wallet, usdt, account3} = await loadFixture(deployFixture);
    await usdt.approve(wallet.target, RANGE);
    await wallet.receiver(RANGE, usdt.target);

    expect(await usdt.balanceOf(wallet.target)).to.equal(RANGE);
    expect(await wallet.balanceOf(riceswap, usdt.target)).to.equal(5000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(next, usdt.target)).to.equal(3000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(marketing, usdt.target)).to.equal(1000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(donations, usdt.target)).to.equal(1000_000_000_000_000_000_000n)

    const INext = wallet.connect(account3);
    await expect(INext.withdraw(ZeroAddress, 1000n)).to.be.revertedWithCustomError(wallet, "RiceswapZeroAddress");

   
  });

  it("Should withdraw balance insufficient", async function () {
    const {wallet, usdt, account3} = await loadFixture(deployFixture);
    await usdt.approve(wallet.target, RANGE);
    await wallet.receiver(RANGE, usdt.target);

    expect(await usdt.balanceOf(wallet.target)).to.equal(RANGE);
    expect(await wallet.balanceOf(riceswap, usdt.target)).to.equal(5000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(next, usdt.target)).to.equal(3000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(marketing, usdt.target)).to.equal(1000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(donations, usdt.target)).to.equal(1000_000_000_000_000_000_000n)

    const INext = wallet.connect(account3);
    await expect(INext.withdraw(usdt.target, RANGE)).to.be.revertedWithCustomError(wallet, "RiceswapInsufficientBalance");

   
  });

  
  it("Should withdraw onlyOwner", async function () {
    const {wallet, usdt, otherAccount} = await loadFixture(deployFixture);
    await usdt.approve(wallet.target, RANGE);
    await wallet.receiver(RANGE, usdt.target);

    expect(await usdt.balanceOf(wallet.target)).to.equal(RANGE);
    expect(await wallet.balanceOf(riceswap, usdt.target)).to.equal(5000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(next, usdt.target)).to.equal(3000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(marketing, usdt.target)).to.equal(1000_000_000_000_000_000_000n)
    expect(await wallet.balanceOf(donations, usdt.target)).to.equal(1000_000_000_000_000_000_000n)

    const INext = wallet.connect(otherAccount);
    await expect(INext.withdraw(usdt.target, RANGE)).to.be.revertedWith("WALLET ERROR");

   
  });

  it("Should changeWallet", async function () {
    const {wallet,otherAccount, account3} = await loadFixture(deployFixture);
    const INext = wallet.connect(account3)
    const tx = await INext.changeWallet(otherAccount);
    const txGasUsed = await tx.wait();
    console.log(`assembly change wallet ${txGasUsed?.gasUsed}`)

    expect(await wallet.nextchain()).to.equal(otherAccount);
  });

 });
});