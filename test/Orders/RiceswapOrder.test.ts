import {
    loadFixture,
    time,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";

  import { ethers } from "hardhat";

  describe("RiceCoin", function () {
   const TIME = 30 *24 *60 *60;
   const AMOUNT = 1000_000_000_000_000_000_000n;
   const RANGE = 10000_000_000_000_000_000_000n

    async function deployFixture() {
      const [owner, otherAccount, account2, account3, account4, account5] = await ethers.getSigners();

        const Order = await ethers.getContractFactory("RiceswapV1Orders");
        const order = await Order.deploy();

        const RiceCoin = await ethers.getContractFactory("RiceCoin");
        const ricecoin = await RiceCoin.deploy();

        const Usdt = await ethers.getContractFactory("Usdt");
        const usdt = await Usdt.deploy();

      return {order, usdt, ricecoin, owner, otherAccount, account2, account3, account4, account5};
    }

    describe("Deployment", function () {
      it("Should orderSell", async function () {
       const {order, ricecoin, usdt} = await loadFixture(deployFixture);

      
       await order.orderSell(ricecoin.target, usdt.target, 10n, 10n, 100000000000n )
  });

  it("Should orderSell", async function () {
    const {order, ricecoin, usdt, otherAccount} = await loadFixture(deployFixture);

   
    await order.orderSell(ricecoin.target, usdt.target, 10n, 10n, 100000000000n )

    const IOther = order.connect(otherAccount);
    await IOther.orderSell(ricecoin.target, usdt.target, 100n, 100n, 100000000000n )
    await IOther.orderSell(ricecoin.target, usdt.target, 200n, 200n, 100000000000n )




    const res = await order.getOrders(ricecoin.target, usdt.target);

    console.log(res)
   });
 });

});

//         address token0;
//         address token1;
//         int128 min;
//         int128 max;
//         uint256 quantity;