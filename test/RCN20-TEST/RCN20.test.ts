// import {
//     loadFixture, time,
//   } from "@nomicfoundation/hardhat-toolbox/network-helpers";
//   import { expect } from "chai";
//   import { ethers } from "hardhat";
  
//   describe("RiceCoin", function () {
//     const AMOUNT = 10_000_000_000_000_000_000n; //10$  //10 * 1% === 0.1
//     const PERCENT = 1_000_000_000_000_000_00n; //0.1$

//     async function deployFixture() {
//       const [owner, otherAccount, accountTwo] = await ethers.getSigners();
    
//       const RiceCoin = await ethers.getContractFactory("RiceCoin");
//       const ricecoin = await RiceCoin.deploy();

//       const Funds = await ethers.getContractFactory("RCN20Funds");
//       const funds = await Funds.deploy();

//       const Usdt = await ethers.getContractFactory("Usdt");
//       const usdt = await Usdt.deploy();

//       const RCN20 = await ethers.getContractFactory("RCN20");
//       const rcn20 = await RCN20.deploy(ricecoin.target, usdt.target);
  
//       return {funds, usdt, ricecoin, rcn20, owner, otherAccount, accountTwo};
//     }
  
//     describe("Deployment", function () {

//       it("Should farm", async function () {
//         const {ricecoin, rcn20, owner} = await loadFixture(deployFixture);

//         const IOwner = ricecoin.connect(owner);
//         IOwner.approve(rcn20.target, 10);

//         const tx = await rcn20.farm(10);
//         const txEtimate = await tx.wait();
//         console.log(`gas use farm: ${txEtimate?.gasUsed.toString()}`)

//         expect(await rcn20._farming(owner.address)).to.equal(10, "balance");
//         expect(await ricecoin.balanceOf(rcn20.target)).to.equal(10, "balance riceCoin")

//         /**
//          * @param price: $0.37
//          */
//       });


//       it("Should farm (insufficient balance)", async function () {
//         const { rcn20, otherAccount} = await loadFixture(deployFixture);
//         const IOther = rcn20.connect(otherAccount);
//         await expect(IOther.farm(10)).to.be.revertedWithCustomError(rcn20, "RCN20InsufficientBalance");
//       });  


//       it("Should farm(amount has bigger 0)", async function () {
//         const { rcn20, owner} = await loadFixture(deployFixture);
//         const IOwner = rcn20.connect(owner);
//         await expect(IOwner.farm(0)).to.be.revertedWithCustomError(rcn20, "RCN20Amount")
//       })


//       it("Should farm(approve this contract)", async function () {
//         const { rcn20, owner} = await loadFixture(deployFixture);
//         const IOwner = rcn20.connect(owner);
//         await expect(IOwner.farm(10)).to.be.revertedWithCustomError(rcn20, "RCN20Approve");
//       });


//       it("Should removeFarm (TIME NOT EXPIRED)", async function () {
//         const {ricecoin, rcn20, owner} = await loadFixture(deployFixture);
//         const IOwner = ricecoin.connect(owner);

//         IOwner.approve(rcn20.target, 10);
//         await rcn20.farm(10);     

//         expect(await rcn20._farming(owner.address)).to.equal(10, "balance");

//         await expect(rcn20.removeFarm(10)).to.be.revertedWithCustomError(rcn20, "RCN20TimeNotExpired");
//       });


//       it("Should removeFarm (BALANCE INSUFFICIENT)", async function () {
//         const {ricecoin, rcn20, owner} = await loadFixture(deployFixture);
//         const IOwner = ricecoin.connect(owner);

//         IOwner.approve(rcn20.target, 10);
//         await rcn20.farm(10);     

//         expect(await rcn20._farming(owner.address)).to.equal(10, "balance");
//         await time.increase(30 *24 *60 *60);

//         await expect(rcn20.removeFarm(20)).to.be.revertedWithCustomError(rcn20, "RCN20InsufficientFarming");
      
//       });


//       it("Should removeFarm", async function () {
//         const {ricecoin, rcn20, otherAccount} = await loadFixture(deployFixture);
//         await ricecoin.transfer(otherAccount.address, 10);

//         const IOther = ricecoin.connect(otherAccount);
//         await IOther.approve(rcn20.target, 10);

//         const IOtherRcn = rcn20.connect(otherAccount);
//         await IOtherRcn.farm(10);     

//         expect(await IOtherRcn._farming(otherAccount.address)).to.equal(10, "balance");
//         expect(await ricecoin.balanceOf(rcn20.target)).to.equal(10n, "balance riceCoin")
        
//         await time.increase(30 *24 *60 *60);
//         const tx = await IOtherRcn.removeFarm(10);
//         const gasUsed = await tx.wait();
//         console.log(`gas used removeFarm: ${gasUsed?.gasUsed}`)

//         /**
//          * @param price: @$0.21 
//          */

//         expect(await ricecoin.balanceOf(otherAccount.address)).to.equal(10);
//         expect(await ricecoin.balanceOf(rcn20.target)).to.equal(0)
//       });


//       it("Should deposit (AMOUNT <= 0)", async function () {
//         const {usdt, rcn20, owner} = await loadFixture(deployFixture);
//         await usdt.approve(rcn20.target, 10);

//         const IOwner = rcn20.connect(owner);
//         await expect(IOwner.deposit(0)).to.be.revertedWithCustomError(rcn20, "RCN20Amount")
//       });

//       it("Should deposit (NOT APPROVE)", async function () {
//         const {rcn20, otherAccount} = await loadFixture(deployFixture);

//         await rcn20.addAdmin(otherAccount.address);
//         const IOther = rcn20.connect(otherAccount);

//         await expect(IOther.deposit(11n)).to.be.revertedWithCustomError(rcn20, "RCN20Approve")
//       });

//       it("Should deposit (NOT PERMISSION)", async function () {
//         const {usdt, rcn20, otherAccount} = await loadFixture(deployFixture);

//         const IOtherUsd = usdt.connect(otherAccount);
//         await IOtherUsd.approve(rcn20.target, 10);
      
//         const IOther = rcn20.connect(otherAccount);

//         await expect(IOther.deposit(10n)).to.be.revertedWith("only admins have permission this function")
//       });


//       it("Should deposit (OWNER) ", async function () {
//         const {usdt, rcn20} = await loadFixture(deployFixture);

//         await usdt.approve(rcn20.target, 10)
//         await rcn20.deposit(10)

//         expect(await usdt.balanceOf(rcn20.target)).to.equal(10);
//         expect(await rcn20.reserve(usdt.target)).to.equal(10);
//       });

//       it("Should deposit (ADMIN) ", async function () {
//         const {usdt, rcn20, otherAccount} = await loadFixture(deployFixture);
//         await usdt.transfer(otherAccount.address, 10);

//         const IOtherUsd = usdt.connect(otherAccount);
//         await IOtherUsd.approve(rcn20.target, 10);
        
//         await rcn20.addAdmin(otherAccount.address);
//         const IOther = rcn20.connect(otherAccount);

//         const tx = await IOther.deposit(10)
//         const txUsed = await tx.wait();
//         console.log(`gas used deposit: ${txUsed?.gasUsed}`)

//         /**
//          * @param price: $0.29 
//          */

//         expect(await usdt.balanceOf(rcn20.target)).to.equal(10);
//         expect(await rcn20.reserve(usdt.target)).to.equal(10);
//       });


//       it("Should withdraw (amount <= 0) ", async function () {
//         const {usdt, rcn20} = await loadFixture(deployFixture);

//         await usdt.approve(rcn20.target, 10)
//         await rcn20.deposit(10)

//         await expect(rcn20.withdraw(0)).to.be.revertedWithCustomError(rcn20, "RCN20Amount")

//       });


//       it("Should withdraw (INSUFFICIENT BALANCE) ", async function () {
//         const {rcn20} = await loadFixture(deployFixture);

//         await expect(rcn20.withdraw(10)).to.be.revertedWithCustomError(rcn20, "RCN20InsufficientBalance")

//       });


//       it("Should withdraw (NOT PERMISSION) ", async function () {
//         const {usdt, rcn20, owner, otherAccount} = await loadFixture(deployFixture);
//         await usdt.approve(rcn20.target, 10);
//         await rcn20.deposit(10);

//         const BALANCEBEFORE = await usdt.balanceOf(owner.address)
//         expect(BALANCEBEFORE).to.equal(1360449999999999999999999990n);

        
//         const IOther = rcn20.connect(otherAccount);

//         await expect(IOther.withdraw(10)).to.be.revertedWith("only admins have permission this function")
//       });


//       it("Should withdraw (OWNER) ", async function () {
//         const {usdt, rcn20, owner} = await loadFixture(deployFixture);

//         await usdt.approve(rcn20.target, 10);
//         await rcn20.deposit(10);

//         const BALANCEBEFORE = await usdt.balanceOf(owner.address)
//         expect(BALANCEBEFORE).to.equal(1360449999999999999999999990n);

//         const tx = await rcn20.withdraw(10);
//         const txUsed = await tx.wait();
//         console.log(`gas used withdraw: ${txUsed?.gasUsed}`);

//         /**
//          * @param price $0.14
//          */

//         expect(await rcn20.reserve(usdt.target)).to.equal(0);
//         expect(await usdt.balanceOf(owner.address)).to.equal(1360450000000000000000000000n);

//       });

//       it("Should withdraw (ADMIN) ", async function () {
//         const {usdt, rcn20, owner, otherAccount} = await loadFixture(deployFixture);
//         await usdt.approve(rcn20.target, 10);
//         await rcn20.deposit(10);

//         const BALANCEBEFORE = await usdt.balanceOf(owner.address)
//         expect(BALANCEBEFORE).to.equal(1360449999999999999999999990n);

//         await rcn20.addAdmin(otherAccount);
//         const IOther = rcn20.connect(otherAccount);

//         await IOther.withdraw(10);
//         expect(await rcn20.reserve(usdt.target)).to.equal(0);
//         expect(await usdt.balanceOf(owner.address)).to.equal(1360450000000000000000000000n);

//       });


//        it("Should payholders (NOT HAVE TOKENS PUT IN FARMING) ", async function () {
//          const {rcn20} = await loadFixture(deployFixture);

//          await expect(rcn20.payholders()).to.revertedWithCustomError(rcn20, "RCN20NotFarmingTokens");

//        });


//        it("Should payholders (TIME BLOCKED)", async function () {
//          const {rcn20, ricecoin} = await loadFixture(deployFixture);

//          ricecoin.approve(rcn20.target, 10);

//          await rcn20.farm(10);
       
//          await expect(rcn20.payholders()).to.revertedWithCustomError(rcn20, "RCN20TimeNotExpired");

//        });


//        it("Should payholders (NOT BALANCE) ", async function () {
//          const {rcn20, ricecoin} = await loadFixture(deployFixture);

//          await ricecoin.approve(rcn20.target, 10);

//          await rcn20.farm(10);
//          await time.increase(30 *24 *60 *60);

//          await expect(rcn20.payholders()).to.revertedWithCustomError(rcn20, "RCN20InsufficientBalance");

//        });


//       it("Should payholders", async function () {
//         const { rcn20, ricecoin, usdt, otherAccount } = await loadFixture(deployFixture);
    
//         await usdt.approve(rcn20.target, AMOUNT);
//         await rcn20.deposit(AMOUNT);
    
//         await ricecoin.transfer(otherAccount.address, AMOUNT);

//         const IOtherCoin = ricecoin.connect(otherAccount);
//         await IOtherCoin.approve(rcn20.target, AMOUNT);
    
//         const IOther = rcn20.connect(otherAccount);
//         await IOther.farm(AMOUNT);
    
//         await time.increase(31 * 24 * 60 * 60);
    
//         const tx = await IOther.payholders();
//         const txUsed = await tx.wait();
//         console.log(`gas used payholders: ${txUsed?.gasUsed}`)

//         /**
//          * @param price $0.27
//          */
        
//         expect(await usdt.balanceOf(otherAccount.address)).to.equal(PERCENT);
//     });


//     it("Should payholders (90 days)", async function () {
//       const { rcn20, ricecoin, usdt, otherAccount } = await loadFixture(deployFixture);
  
//       await usdt.approve(rcn20.target, AMOUNT);
//       await rcn20.deposit(AMOUNT);
  
//       await ricecoin.transfer(otherAccount.address, AMOUNT);

//       const IOtherCoin = ricecoin.connect(otherAccount);
//       await IOtherCoin.approve(rcn20.target, AMOUNT);
  
//       const IOther = rcn20.connect(otherAccount);
//       await IOther.farm(AMOUNT);
  
//       await time.increase(90 * 24 * 60 * 60);
  
//       const tx = await IOther.payholders();
//       const txUsed = await tx.wait();
//       console.log(`gas used payholders: ${txUsed?.gasUsed}`)

//       /**
//        * @param price $0.27
//        */
      
//       expect(await usdt.balanceOf(otherAccount.address)).to.equal(300000000000000000n);
//   });


//     it("Should addAdmin (NOT PERMISSION)", async function () {
//       const { rcn20, otherAccount} = await loadFixture(deployFixture);
//       const IOther = rcn20.connect(otherAccount);

//       await expect(IOther.addAdmin(otherAccount.address)).to.be.revertedWith("only owner permission");
//   });


//     it("Should addAdmin ()", async function () {
//       const { rcn20, otherAccount} = await loadFixture(deployFixture);
//       const tx = await rcn20.addAdmin(otherAccount.address);
//       const txUsed = await tx.wait();
//       console.log(`gas used addAdmin: ${txUsed?.gasUsed}`)

//       /**
//        * @param price $ 0.15
//        */
//       expect(await rcn20._admins(otherAccount.address)).to.equal(true);     
//   });


//   it("Should addAdmin ()", async function () {
//     const { rcn20, otherAccount} = await loadFixture(deployFixture);
//     const tx = await rcn20.removeAdmin(otherAccount.address);
//     const txUsed = await tx.wait();
//     console.log(`gas used removeAdmin: ${txUsed?.gasUsed}`)

//     /**
//      * @param price $ 0.9
//      */
//     expect(await rcn20._admins(otherAccount.address)).to.equal(false);     
// });


// it("Should getValidate", async function () {
//   const {ricecoin, rcn20, owner} = await loadFixture(deployFixture);

//   const IOwner = ricecoin.connect(owner);
//   IOwner.approve(rcn20.target, 10);

//    await rcn20.farm(10);
//    const wallet = await rcn20.getWallets();
//    expect(wallet).to.equal(wallet);

// });


// it("Should checkValidate", async function () {
//   const {ricecoin, rcn20, owner} = await loadFixture(deployFixture);

//   const IOwner = ricecoin.connect(owner);
//   IOwner.approve(rcn20.target, 10);

//    await rcn20.farm(10);

//    expect(await rcn20.checkValidator(owner.address)).to.equal(false);

// });


// it("Should validate (TIME BLOCKED)", async function () {
//   const { rcn20, ricecoin, usdt, otherAccount, accountTwo } = await loadFixture(deployFixture);

//   await usdt.approve(rcn20.target, AMOUNT);
//   await rcn20.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(rcn20.target, AMOUNT);

//   const IOther = rcn20.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(29 * 24 * 60 * 60);

//   const IValidate = rcn20.connect(accountTwo);

//   await expect(IValidate.validate(otherAccount.address)).to.revertedWithCustomError(rcn20, "RCN20TimeNotExpired");

// });



// it("Should validate", async function () {
//   const { rcn20, ricecoin, usdt, otherAccount, accountTwo } = await loadFixture(deployFixture);

//   await usdt.approve(rcn20.target, AMOUNT);
//   await rcn20.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(rcn20.target, AMOUNT);

//   const IOther = rcn20.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(31 * 24 * 60 * 60);

//   const IValidate = rcn20.connect(accountTwo);

//   const tx = await IValidate.validate(otherAccount.address);
//   const txUsed = await tx.wait();
//   console.log(`gas used validate: ${txUsed?.gasUsed}`)

//   /**
//    * @param price $0.52
//    */
  
//   expect(await usdt.balanceOf(otherAccount.address)).to.equal(99000000000000000n, "receiver");
//   expect(await usdt.balanceOf(accountTwo.address)).to.equal(1000000000000000n, "validator")
// });


// it("Should payholders (NOT BALANCE) ", async function () {
//   const {rcn20, ricecoin} = await loadFixture(deployFixture);

//   await ricecoin.approve(rcn20.target, 10);

//   await rcn20.farm(10);
//   await time.increase(30 *24 *60 *60);

//   await expect(rcn20.validate(rcn20)).to.revertedWithCustomError(rcn20, "RCN20NotFarmingTokens");

// });


// it("Should pausable", async function () {
//   const { rcn20} = await loadFixture(deployFixture);

//   const tx = await rcn20.pause();
//   const txUsed = await tx.wait();
//   console.log(`gas used pausable: ${txUsed?.gasUsed}`)
//   expect(await rcn20.isPause()).to.equal(true)
  
// });

// it("Should unpause", async function () {
//   const { rcn20} = await loadFixture(deployFixture);

//   const tx = await rcn20.unpause();
//   const txUsed = await tx.wait();
//   console.log(`gas used unpause: ${txUsed?.gasUsed}`)
//   expect(await rcn20.isPause()).to.equal(false);
  
// });


// it("Should pausable validate", async function () {
//   const { rcn20, ricecoin, usdt, otherAccount, accountTwo } = await loadFixture(deployFixture);

//   await usdt.approve(rcn20.target, AMOUNT);
//   await rcn20.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(rcn20.target, AMOUNT);

//   const IOther = rcn20.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(31 * 24 * 60 * 60);

//   const IValidate = rcn20.connect(accountTwo);

//   await rcn20.pause();

//   await expect(IValidate.validate(otherAccount.address)).to.be.revertedWith("This protocol has not yet started")

// });


// it("Should canFarmHolders", async function () {
//   const { rcn20, ricecoin, usdt, funds } = await loadFixture(deployFixture);

//   await usdt.approve(rcn20.target, AMOUNT);
//   await rcn20.deposit(AMOUNT);

//   await ricecoin.transfer(funds.target, AMOUNT);

//   await funds._approve(ricecoin.target, rcn20.target, AMOUNT)

//   await funds.ReceiveFarmHolders(rcn20.target, AMOUNT);


//   expect(await rcn20._farming(funds.target)).to.equal(AMOUNT);
//   expect(await ricecoin.balanceOf(funds.target)).to.equal(0);

// });


// it("Should canPayHolders", async function () {
//   const { rcn20, ricecoin, usdt, funds } = await loadFixture(deployFixture);

//   await usdt.approve(rcn20.target, AMOUNT);
//   await rcn20.deposit(AMOUNT);

//   await ricecoin.transfer(funds.target, AMOUNT);

//   await funds._approve(ricecoin.target, rcn20.target, AMOUNT)

//   await funds.ReceiveFarmHolders(rcn20.target, AMOUNT);


//   await time.increase(30 *24 *60 *60);

//   await funds.ReceivePayHolders(rcn20.target);

//   expect(await usdt.balanceOf(funds.target)).to.equal(PERCENT);

// });

// it("Should canRemoveHolders", async function () {
//   const { rcn20, ricecoin, usdt, funds } = await loadFixture(deployFixture);

//   await usdt.approve(rcn20.target, AMOUNT);
//   await rcn20.deposit(AMOUNT);

//   await ricecoin.transfer(funds.target, AMOUNT);

//   await funds._approve(ricecoin.target, rcn20.target, AMOUNT)

//   await funds.ReceiveFarmHolders(rcn20.target, AMOUNT);

//   await time.increase(30 *24 *60 *60);

//   await funds.ReceiveRemoveFarm(rcn20.target, AMOUNT);

//   expect(await ricecoin.balanceOf(funds.target)).to.equal(AMOUNT);

// });








//       it("Should test ", async function () {
//         const {rcn20} = await loadFixture(deployFixture);

//         //diahoje - tempoPassado retorna o tempo que a pessoa ficou em segundos por exemplo 2_592_000 * 2 = 2 meses 
//         const diaHoje = Date.now();
//         const tempoPassado = Date.now() - 60 *24 *60 *60; //aqui estou simulando o tempo que o usuario passou no contrato

//         const TimeInMonth = diaHoje - tempoPassado;     //aqui estamos descobrindo quanto tempo o user ficou
//          const timer = TimeInMonth / (30 *24 *60 *60); //bom  agora fica mais facil, aqui descobrimos quanto tempo em meses ele ficou ou seja convertendo o tempo de segundos para meses: 
//                                                       //timeMonth -> armazena o dia de hoje menos o tempo passado para pegar o time que o usuario ficou ou seja agora vamos dividir esse tempo em 30 dias para ver quanto meses ele ficou
//                                                       //60 / 30 = 2 ou seja 2 meses
//         console.log(timer);

//       });

//     });
//   });
  