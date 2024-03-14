const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const TEST_USERNAME = "test_username"
const LABEL_HASH = ethers.id(TEST_USERNAME) //computes keccak256 hash

const SECOND_TEST_USERNAME = "test_username_2"
const SECOND_LABEL_HASH = ethers.id(SECOND_TEST_USERNAME) //compuets keccak256 hash

describe("Bank", function () {
    
    async function deployFixture() {
      
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const Bank = await ethers.getContractFactory("Bank");
      const bank = await Bank.deploy();
  
      return { bank, owner, otherAccount };
    }

    async function deployAccountCreatedFixture() {
        const { bank, owner, otherAccount } = await loadFixture(deployFixture);
        await bank.createAccount(TEST_USERNAME)

        return { bank, owner, otherAccount }
    }

    async function deployAccountWithBalanceFixture() {
        const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

        const INITIAL_BALANCE = 10

        await bank.deposit(INITIAL_BALANCE)

        return { bank, owner }
    }

    describe("Create an account (25 points total)", function () {
        it("Should create a new account and set owner to msg.sender (+5 points)", async function () {
          const { bank, owner } = await loadFixture(deployAccountCreatedFixture);

          let account = await bank.accounts(owner)
          expect(account.owner).to.equal(owner)

        });

        it("Should create a new account and set usernameHash (+4 points)", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture);
  
            let account = await bank.accounts(owner)

            
            expect(account.usernameHash).to.equal(LABEL_HASH)
        });

        it("Should create a new account and set accountExists mapping for owner to true (+4 points)", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture);

            let result = await bank.accountExists(owner)

            expect(result).to.equal(true)
        });

        it("Should create a new account and set usernames mapping for usernameHash to msg.sender (+4 points)", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture);

            let address = await bank.usernames(LABEL_HASH)

            expect(address).to.equal(owner)
        });

        it("Should not create an account if the user already has one (+4 points)", async function () {
          const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

          await expect(bank.createAccount(TEST_USERNAME)).to.be.reverted
        })

        it("Should not create an account if the username is already taken (+4 points)", async function () {
            const { bank, owner, otherAccount } = await loadFixture(deployAccountCreatedFixture)
  
            bank.connect(otherAccount)

            await expect(bank.createAccount(TEST_USERNAME)).to.be.reverted
        })

    })

    // describe("Deposit funds (25 points total)", function() {
    //     it("Should deposit funds into the account (+12.5 points)", async function () {
    //         const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

    //         await expect(bank.deposit({value: BigInt(10)})).to.changeEtherBalances(
    //             [bank.target, owner],
    //             [10, -10]
    //         );

    //         let account = await bank.accounts(owner)

    //         expect(account.balance).to.equal(10)
    //     }) 

    //     it("Should not deposit if the user has not created an account (+12.5 points)", async function () {
    //         const { bank, owner } = await loadFixture(deployFixture)
  
    //         await expect(bank.deposit({value: BigInt(10)})).to.be.reverted;
    //     })
    // })

    // describe("Withdraw funds (+25 points)", function() {
    //     it("Should subtract the amount from the balance (+9 points)", async function () {
    //         const { bank, owner } = await loadFixture(deployAccountWithBalanceFixture)

    //         await expect(bank.withdraw(BigInt(9))).to.changeEtherBalances(
    //             [bank.target, owner],
    //             [-9, 9]
    //         );

    //         let account = await bank.accounts(owner)

    //         expect(account.balance).to.equal(1)
    //     })

    //     it("Should not withdraw if the user has not created an account (+8 points)", async function () {
    //         const { bank, owner } = await loadFixture(deployFixture)
  
    //         await expect(bank.withdraw(BigInt(9))).to.be.reverted;
    //     })

    //     it("Should not withdraw if the user does not have enough funds in bank (+8 points)", async function () {
    //         const { bank, owner } = await loadFixture(deployAccountWithBalanceFixture)

    //         await expect(bank.withdraw(11)).to.be.reverted;
    //     })
    // })


    describe("Deposit funds - Given to you, from previous assignment", function() {
        it("Should deposit funds into the account", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

            await bank.deposit(10)

            let account = await bank.accounts(owner)

            expect(account.balance).to.equal(10)

        }) 

        it("Should not deposit if the user has not created an account", async function () {
            const { bank, owner } = await loadFixture(deployFixture)
  
            await expect(bank.deposit(10)).to.be.reverted;

        })
    })

    describe("Withdraw funds - Given to you, from previous assignment", function() {
        it("Should subtract the amount from the balance", async function () {
            const { bank, owner } = await loadFixture(deployAccountWithBalanceFixture)

            await bank.withdraw(9)

            let account = await bank.accounts(owner)

            expect(account.balance).to.equal(1)

        })

        it("Should not withdraw if the user has not created an account", async function () {
            const { bank, owner } = await loadFixture(deployFixture)
  
            await expect(bank.withdraw(9)).to.be.reverted;

        })

        it("Should not withdraw if the user does not have enough funds in bank", async function () {
            const { bank, owner } = await loadFixture(deployAccountWithBalanceFixture)

            await expect(bank.withdraw(11)).to.be.reverted;

        })
    })

    describe("Hash username (+25 points)", function() {
        it("Should hash username with keccak256", async function() {
            const { bank, owner } = await loadFixture(deployFixture)
            let hash = await bank.hashUsername(TEST_USERNAME)
            expect(hash).to.be.equal(LABEL_HASH)
        })
    })

    describe("Search by username (+25 points)", function() {
        it("Should return the account of the username searched", async function() {
            const {bank, owner} = await loadFixture(deployAccountCreatedFixture)

            let account = await bank.searchByUsername(TEST_USERNAME)

            expect(account.owner).to.be.equal(owner)
        })
    })

    describe("Edit username (+25 points)", function() {
        it("Should not edit username if the username is already taken (+5 points)", async function () {
            const { bank, owner, otherAccount } = await loadFixture(deployAccountCreatedFixture)
  
            bank.connect(otherAccount)
            bank.createAccount(SECOND_TEST_USERNAME)

            await expect(bank.editUsername(TEST_USERNAME)).to.be.reverted
        })

        it("Should not edit username if no account exists (+5 points)", async function () {
            const { bank, owner } = await loadFixture(deployFixture)

            await expect(bank.editUsername(TEST_USERNAME)).to.be.reverted
        })

        it("Should set usernameHash field in account to new username (+5 points)", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

            await bank.editUsername(SECOND_TEST_USERNAME)
            let account = await bank.accounts(owner)

            expect(account.usernameHash).to.be.equal(SECOND_LABEL_HASH)
        })

        it("Should map new usernameHash to address (+5 points)", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

            await bank.editUsername(SECOND_TEST_USERNAME)

            let address = await bank.usernames(SECOND_LABEL_HASH)

            expect(address).to.be.equal(owner)
        })

        it("Should delete the old username and address pair (+5 points)", async function () {
            const { bank, owner } = await loadFixture(deployAccountCreatedFixture)

            await bank.editUsername(SECOND_TEST_USERNAME)

            let address = await bank.usernames(LABEL_HASH)

            expect(address).to.be.equal(ethers.ZeroAddress)
        })
    })
})