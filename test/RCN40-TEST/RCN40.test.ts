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

//       const Funds = await ethers.getContractFactory("RCN40Funds");
//       const funds = await Funds.deploy();

//       const Usdt = await ethers.getContractFactory("Usdt");
//       const usdt = await Usdt.deploy();

//       const rcn40 = await ethers.getContractFactory("RCN40");
//       const RCN40 = await rcn40.deploy(ricecoin.target, usdt.target);
  
//       return {funds, usdt, ricecoin, RCN40, owner, otherAccount, accountTwo};
//     }
  
//     describe("Deployment", function () {

//       it("Should farm", async function () {
//         const {ricecoin, RCN40, owner} = await loadFixture(deployFixture);

//         const IOwner = ricecoin.connect(owner);
//         IOwner.approve(RCN40.target, 10);

//         const tx = await RCN40.farm(10);
//         const txEtimate = await tx.wait();
//         console.log(`gas use farm: ${txEtimate?.gasUsed.toString()}`)

//         expect(await RCN40._farming(owner.address)).to.equal(10, "balance");
//         expect(await ricecoin.balanceOf(RCN40.target)).to.equal(10, "balance riceCoin")

//         /**
//          * @param price: $0.37
//          */
//       });


//       it("Should farm (insufficient balance)", async function () {
//         const { RCN40, otherAccount} = await loadFixture(deployFixture);
//         const IOther = RCN40.connect(otherAccount);
//         await expect(IOther.farm(10)).to.be.revertedWithCustomError(RCN40, "RCN40InsufficientBalance");
//       });  


//       it("Should farm(amount has bigger 0)", async function () {
//         const { RCN40, owner} = await loadFixture(deployFixture);
//         const IOwner = RCN40.connect(owner);
//         await expect(IOwner.farm(0)).to.be.revertedWithCustomError(RCN40, "RCN40Amount")
//       })


//       it("Should farm(approve this contract)", async function () {
//         const { RCN40, owner} = await loadFixture(deployFixture);
//         const IOwner = RCN40.connect(owner);
//         await expect(IOwner.farm(10)).to.be.revertedWithCustomError(RCN40, "RCN40Approve");
//       });


//       it("Should removeFarm (TIME NOT EXPIRED)", async function () {
//         const {ricecoin, RCN40, owner} = await loadFixture(deployFixture);
//         const IOwner = ricecoin.connect(owner);

//         IOwner.approve(RCN40.target, 10);
//         await RCN40.farm(10);     

//         expect(await RCN40._farming(owner.address)).to.equal(10, "balance");

//         await expect(RCN40.removeFarm(10)).to.be.revertedWithCustomError(RCN40, "RCN40TimeNotExpired");
//       });


//       it("Should removeFarm (BALANCE INSUFFICIENT)", async function () {
//         const {ricecoin, RCN40, owner} = await loadFixture(deployFixture);
//         const IOwner = ricecoin.connect(owner);

//         IOwner.approve(RCN40.target, 10);
//         await RCN40.farm(10);     

//         expect(await RCN40._farming(owner.address)).to.equal(10, "balance");
//         await time.increase(30 *24 *60 *60);

//         await expect(RCN40.removeFarm(20)).to.be.revertedWithCustomError(RCN40, "RCN40InsufficientFarming");
      
//       });


//       it("Should removeFarm", async function () {
//         const {ricecoin, RCN40, otherAccount} = await loadFixture(deployFixture);
//         await ricecoin.transfer(otherAccount.address, 10);

//         const IOther = ricecoin.connect(otherAccount);
//         await IOther.approve(RCN40.target, 10);

//         const IOtherRcn = RCN40.connect(otherAccount);
//         await IOtherRcn.farm(10);     

//         expect(await IOtherRcn._farming(otherAccount.address)).to.equal(10, "balance");
//         expect(await ricecoin.balanceOf(RCN40.target)).to.equal(10n, "balance riceCoin")
        
//         await time.increase(30 *24 *60 *60);
//         const tx = await IOtherRcn.removeFarm(10);
//         const gasUsed = await tx.wait();
//         console.log(`gas used removeFarm: ${gasUsed?.gasUsed}`)

//         /**
//          * @param price: @$0.21 
//          */

//         expect(await ricecoin.balanceOf(otherAccount.address)).to.equal(10);
//         expect(await ricecoin.balanceOf(RCN40.target)).to.equal(0)
//       });


//       it("Should deposit (AMOUNT <= 0)", async function () {
//         const {usdt, RCN40, owner} = await loadFixture(deployFixture);
//         await usdt.approve(RCN40.target, 10);

//         const IOwner = RCN40.connect(owner);
//         await expect(IOwner.deposit(0)).to.be.revertedWithCustomError(RCN40, "RCN40Amount")
//       });

//       it("Should deposit (NOT APPROVE)", async function () {
//         const {RCN40, otherAccount} = await loadFixture(deployFixture);

//         await RCN40.addAdmin(otherAccount.address);
//         const IOther = RCN40.connect(otherAccount);

//         await expect(IOther.deposit(11n)).to.be.revertedWithCustomError(RCN40, "RCN40Approve")
//       });

//       it("Should deposit (NOT PERMISSION)", async function () {
//         const {usdt, RCN40, otherAccount} = await loadFixture(deployFixture);

//         const IOtherUsd = usdt.connect(otherAccount);
//         await IOtherUsd.approve(RCN40.target, 10);
      
//         const IOther = RCN40.connect(otherAccount);

//         await expect(IOther.deposit(10n)).to.be.revertedWith("only admins have permission this function")
//       });


//       it("Should deposit (OWNER) ", async function () {
//         const {usdt, RCN40} = await loadFixture(deployFixture);

//         await usdt.approve(RCN40.target, 10)
//         await RCN40.deposit(10)

//         expect(await usdt.balanceOf(RCN40.target)).to.equal(10);
//         expect(await RCN40.reserve(usdt.target)).to.equal(10);
//       });

//       it("Should deposit (ADMIN) ", async function () {
//         const {usdt, RCN40, otherAccount} = await loadFixture(deployFixture);
//         await usdt.transfer(otherAccount.address, 10);

//         const IOtherUsd = usdt.connect(otherAccount);
//         await IOtherUsd.approve(RCN40.target, 10);
        
//         await RCN40.addAdmin(otherAccount.address);
//         const IOther = RCN40.connect(otherAccount);

//         const tx = await IOther.deposit(10)
//         const txUsed = await tx.wait();
//         console.log(`gas used deposit: ${txUsed?.gasUsed}`)

//         /**
//          * @param price: $0.29 
//          */

//         expect(await usdt.balanceOf(RCN40.target)).to.equal(10);
//         expect(await RCN40.reserve(usdt.target)).to.equal(10);
//       });


//       it("Should withdraw (amount <= 0) ", async function () {
//         const {usdt, RCN40} = await loadFixture(deployFixture);

//         await usdt.approve(RCN40.target, 10)
//         await RCN40.deposit(10)

//         await expect(RCN40.withdraw(0)).to.be.revertedWithCustomError(RCN40, "RCN40Amount")

//       });


//       it("Should withdraw (INSUFFICIENT BALANCE) ", async function () {
//         const {RCN40} = await loadFixture(deployFixture);

//         await expect(RCN40.withdraw(10)).to.be.revertedWithCustomError(RCN40, "RCN40InsufficientBalance")

//       });


//       it("Should withdraw (NOT PERMISSION) ", async function () {
//         const {usdt, RCN40, owner, otherAccount} = await loadFixture(deployFixture);
//         await usdt.approve(RCN40.target, 10);
//         await RCN40.deposit(10);

//         const BALANCEBEFORE = await usdt.balanceOf(owner.address)
//         expect(BALANCEBEFORE).to.equal(1360449999999999999999999990n);

        
//         const IOther = RCN40.connect(otherAccount);

//         await expect(IOther.withdraw(10)).to.be.revertedWith("only admins have permission this function")
//       });


//       it("Should withdraw (OWNER) ", async function () {
//         const {usdt, RCN40, owner} = await loadFixture(deployFixture);

//         await usdt.approve(RCN40.target, 10);
//         await RCN40.deposit(10);

//         const BALANCEBEFORE = await usdt.balanceOf(owner.address)
//         expect(BALANCEBEFORE).to.equal(1360449999999999999999999990n);

//         const tx = await RCN40.withdraw(10);
//         const txUsed = await tx.wait();
//         console.log(`gas used withdraw: ${txUsed?.gasUsed}`);

//         /**
//          * @param price $0.14
//          */

//         expect(await RCN40.reserve(usdt.target)).to.equal(0);
//         expect(await usdt.balanceOf(owner.address)).to.equal(1360450000000000000000000000n);

//       });

//       it("Should withdraw (ADMIN) ", async function () {
//         const {usdt, RCN40, owner, otherAccount} = await loadFixture(deployFixture);
//         await usdt.approve(RCN40.target, 10);
//         await RCN40.deposit(10);

//         const BALANCEBEFORE = await usdt.balanceOf(owner.address)
//         expect(BALANCEBEFORE).to.equal(1360449999999999999999999990n);

//         await RCN40.addAdmin(otherAccount);
//         const IOther = RCN40.connect(otherAccount);

//         await IOther.withdraw(10);
//         expect(await RCN40.reserve(usdt.target)).to.equal(0);
//         expect(await usdt.balanceOf(owner.address)).to.equal(1360450000000000000000000000n);

//       });


//        it("Should payholders (NOT HAVE TOKENS PUT IN FARMING) ", async function () {
//          const {RCN40} = await loadFixture(deployFixture);

//          await expect(RCN40.payholders()).to.revertedWithCustomError(RCN40, "RCN40NotFarmingTokens");

//        });


//        it("Should payholders (TIME BLOCKED)", async function () {
//          const {RCN40, ricecoin} = await loadFixture(deployFixture);

//          ricecoin.approve(RCN40.target, 10);

//          await RCN40.farm(10);
       
//          await expect(RCN40.payholders()).to.revertedWithCustomError(RCN40, "RCN40TimeNotExpired");

//        });


//        it("Should payholders (NOT BALANCE) ", async function () {
//          const {RCN40, ricecoin} = await loadFixture(deployFixture);

//          await ricecoin.approve(RCN40.target, 10);

//          await RCN40.farm(10);
//          await time.increase(30 *24 *60 *60);

//          await expect(RCN40.payholders()).to.revertedWithCustomError(RCN40, "RCN40InsufficientBalance");

//        });


//       it("Should payholders", async function () {
//         const { RCN40, ricecoin, usdt, otherAccount } = await loadFixture(deployFixture);
    
//         await usdt.approve(RCN40.target, AMOUNT);
//         await RCN40.deposit(AMOUNT);
    
//         await ricecoin.transfer(otherAccount.address, AMOUNT);

//         const IOtherCoin = ricecoin.connect(otherAccount);
//         await IOtherCoin.approve(RCN40.target, AMOUNT);
    
//         const IOther = RCN40.connect(otherAccount);
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
//       const { RCN40, ricecoin, usdt, otherAccount } = await loadFixture(deployFixture);
  
//       await usdt.approve(RCN40.target, AMOUNT);
//       await RCN40.deposit(AMOUNT);
  
//       await ricecoin.transfer(otherAccount.address, AMOUNT);

//       const IOtherCoin = ricecoin.connect(otherAccount);
//       await IOtherCoin.approve(RCN40.target, AMOUNT);
  
//       const IOther = RCN40.connect(otherAccount);
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
//       const { RCN40, otherAccount} = await loadFixture(deployFixture);
//       const IOther = RCN40.connect(otherAccount);

//       await expect(IOther.addAdmin(otherAccount.address)).to.be.revertedWith("only owner permission");
//   });


//     it("Should addAdmin ()", async function () {
//       const { RCN40, otherAccount} = await loadFixture(deployFixture);
//       const tx = await RCN40.addAdmin(otherAccount.address);
//       const txUsed = await tx.wait();
//       console.log(`gas used addAdmin: ${txUsed?.gasUsed}`)

//       /**
//        * @param price $ 0.15
//        */
//       expect(await RCN40._admins(otherAccount.address)).to.equal(true);     
//   });


//   it("Should addAdmin ()", async function () {
//     const { RCN40, otherAccount} = await loadFixture(deployFixture);
//     const tx = await RCN40.removeAdmin(otherAccount.address);
//     const txUsed = await tx.wait();
//     console.log(`gas used removeAdmin: ${txUsed?.gasUsed}`)

//     /**
//      * @param price $ 0.9
//      */
//     expect(await RCN40._admins(otherAccount.address)).to.equal(false);     
// });


// it("Should getValidate", async function () {
//   const {ricecoin, RCN40, owner} = await loadFixture(deployFixture);

//   const IOwner = ricecoin.connect(owner);
//   IOwner.approve(RCN40.target, 10);

//    await RCN40.farm(10);
//    const wallet = await RCN40.getWallets();
//    expect(wallet).to.equal(wallet);

// });


// it("Should checkValidate", async function () {
//   const {ricecoin, RCN40, owner} = await loadFixture(deployFixture);

//   const IOwner = ricecoin.connect(owner);
//   IOwner.approve(RCN40.target, 10);

//    await RCN40.farm(10);

//    expect(await RCN40.checkValidator(owner.address)).to.equal(false);

// });


// it("Should validate (TIME BLOCKED)", async function () {
//   const { RCN40, ricecoin, usdt, otherAccount, accountTwo } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(RCN40.target, AMOUNT);

//   const IOther = RCN40.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(29 * 24 * 60 * 60);

//   const IValidate = RCN40.connect(accountTwo);

//   await expect(IValidate.validate(otherAccount.address)).to.revertedWithCustomError(RCN40, "RCN40TimeNotExpired");

// });



// it("Should validate", async function () {
//   const { RCN40, ricecoin, usdt, otherAccount, accountTwo } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(RCN40.target, AMOUNT);

//   const IOther = RCN40.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(31 * 24 * 60 * 60);

//   const IValidate = RCN40.connect(accountTwo);

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
//   const {RCN40, ricecoin} = await loadFixture(deployFixture);

//   await ricecoin.approve(RCN40.target, 10);

//   await RCN40.farm(10);
//   await time.increase(30 *24 *60 *60);

//   await expect(RCN40.validate(RCN40)).to.revertedWithCustomError(RCN40, "RCN40NotFarmingTokens");

// });


// it("Should pausable", async function () {
//   const { RCN40} = await loadFixture(deployFixture);

//   const tx = await RCN40.pause();
//   const txUsed = await tx.wait();
//   console.log(`gas used pausable: ${txUsed?.gasUsed}`)
//   expect(await RCN40.isPause()).to.equal(true)
  
// });

// it("Should unpause", async function () {
//   const { RCN40} = await loadFixture(deployFixture);

//   const tx = await RCN40.unpause();
//   const txUsed = await tx.wait();
//   console.log(`gas used unpause: ${txUsed?.gasUsed}`)
//   expect(await RCN40.isPause()).to.equal(false);
  
// });


// it("Should pausable validate", async function () {
//   const { RCN40, ricecoin, usdt, otherAccount, accountTwo } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(RCN40.target, AMOUNT);

//   const IOther = RCN40.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(31 * 24 * 60 * 60);

//   const IValidate = RCN40.connect(accountTwo);

//   await RCN40.pause();

//   await expect(IValidate.validate(otherAccount.address)).to.be.revertedWith("This protocol has not yet started")

// });


// it("Should canFarmHolders", async function () {
//   const { RCN40, ricecoin, usdt, funds } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(funds.target, AMOUNT);

//   await funds._approve(ricecoin.target, RCN40.target, AMOUNT)

//   await funds.ReceiveFarmHolders(RCN40.target, AMOUNT);


//   expect(await RCN40._farming(funds.target)).to.equal(AMOUNT);
//   expect(await ricecoin.balanceOf(funds.target)).to.equal(0);

// });


// it("Should canPayHolders", async function () {
//   const { RCN40, ricecoin, usdt, funds } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(funds.target, AMOUNT);

//   await funds._approve(ricecoin.target, RCN40.target, AMOUNT)

//   await funds.ReceiveFarmHolders(RCN40.target, AMOUNT);


//   await time.increase(30 *24 *60 *60);

//   await funds.ReceivePayHolders(RCN40.target);

//   expect(await usdt.balanceOf(funds.target)).to.equal(PERCENT);

// });

// it("Should canRemoveHolders", async function () {
//   const { RCN40, ricecoin, usdt, funds } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(funds.target, AMOUNT);

//   await funds._approve(ricecoin.target, RCN40.target, AMOUNT)

//   await funds.ReceiveFarmHolders(RCN40.target, AMOUNT);

//   await time.increase(30 *24 *60 *60);

//   await funds.ReceiveRemoveFarm(RCN40.target, AMOUNT);

//   expect(await ricecoin.balanceOf(funds.target)).to.equal(AMOUNT);

// });


// it("Should variable fee", async function () {
//   const { RCN40, } = await loadFixture(deployFixture);

//   await RCN40.variableFee(2);

//   expect(await RCN40.monthlyFee()).to.equal(2); 
// });

// it("Should payholders", async function () {
//   const { RCN40, ricecoin, usdt, otherAccount } = await loadFixture(deployFixture);

//   await usdt.approve(RCN40.target, AMOUNT);
//   await RCN40.deposit(AMOUNT);

//   await ricecoin.transfer(otherAccount.address, AMOUNT);

//   const IOtherCoin = ricecoin.connect(otherAccount);
//   await IOtherCoin.approve(RCN40.target, AMOUNT);

//   const IOther = RCN40.connect(otherAccount);
//   await IOther.farm(AMOUNT);

//   await time.increase(31 * 24 * 60 * 60);

//   await RCN40.variableFee(2);

//   const tx = await IOther.payholders();
//   const txUsed = await tx.wait();
//   console.log(`gas used payholders: ${txUsed?.gasUsed}`)

//   /**
//    * @param price $0.27
//    */
  
//   expect(await usdt.balanceOf(otherAccount.address)).to.equal(PERCENT * 2n);
// });








//       it("Should test ", async function () {
//         const {RCN40} = await loadFixture(deployFixture);

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
  