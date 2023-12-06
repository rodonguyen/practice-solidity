import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { FundMe, MockV3Aggregator } from "../../typechain-types"

describe("FundMe", function () {
  let fundMe: FundMe
  let mockV3Aggregator: MockV3Aggregator
  let deployer: SignerWithAddress
  beforeEach(async () => {
    if (!developmentChains.includes(network.name)) {
      throw "You need to be on a development chain to run tests"
    }
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    await deployments.fixture(["all"])
    fundMe = await ethers.getContract("FundMe")
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
  })

  describe("constructor", function () {
    it("sets the aggregator addresses correctly", async () => {
      const response = await fundMe.getPriceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe("fund", function () {
    // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
    // could also do assert.fail
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      )
    })

    // we could be even more precise here by making sure exactly $50 works
    // but this is good enough for now
    it("Updates the amount funded data structure", async () => {
      await fundMe.fund({ value: ethers.utils.parseEther("1") })
      const response = await fundMe.getAmountFundedFromAddress(deployer.address)
      assert.equal(response.toString(), ethers.utils.parseEther("1").toString())
    })

    it("Adds funder to array of funders", async () => {
      await fundMe.fund({ value: ethers.utils.parseEther("1") })
      const response = await fundMe.getFunderAddress(0)
      assert.equal(response, deployer.address)
    })
  })

  describe("withdraw", function () {
    beforeEach(async () => {
      await fundMe.fund({ value: ethers.utils.parseEther("1") })
    })
    it("Allow withdraw all ETH to owner with a single funder", async () => {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      )

      // Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait()
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      )

      // Assert
      assert.equal(endingFundMeBalance.toString(), "0")
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      )
    })

    // this test is overloaded. Ideally we'd split it into multiple tests
    // but for simplicity we left it as one
    it("Allows us to withdraw with multiple funders", async () => {
      const accounts = await ethers.getSigners()
      for (let i = 1; i < 6; i++) {
        await fundMe
          .connect(accounts[1])
          .fund({ value: ethers.utils.parseEther("1") })
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      )
      const transactionResponse = await fundMe.cheaperWithdraw()

      const transactionReceipt = await transactionResponse.wait()
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
      // console.log(`GasCost: ${withdrawGasCost}`)
      // console.log(`GasUsed: ${gasUsed}`)
      // console.log(`GasPrice: ${effectiveGasPrice}`)
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      )

      // Assert
      assert.equal(endingFundMeBalance.toString(), "0")
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(withdrawGasCost).toString()
      )
      await expect(fundMe.getFunderAddress(0)).to.be.reverted

      for (let i = 1; i < 6; i++) {
        assert.equal(
          (
            await fundMe.getAmountFundedFromAddress(accounts[i].address)
          ).toString(),
          "0"
        )
      }
    })

    it("Block non-owner to withdraw", async () => {
      const accounts = await ethers.getSigners()
      const nonOwnerAccount = accounts[1]
      const fundMeConnectedToNonOwnerAccountContract = await fundMe.connect(
        nonOwnerAccount
      )
      await expect(
        fundMeConnectedToNonOwnerAccountContract.withdraw()
      ).to.be.revertedWith("FundMe__NotOwner")
    })
  })
})
