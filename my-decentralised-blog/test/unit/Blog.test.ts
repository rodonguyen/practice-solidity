import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { Blog } from "../../typechain-types"
import { BigNumber } from "ethers"

describe("Blog", function () {
  let blog: Blog
  let deployer: SignerWithAddress
  let account2: SignerWithAddress

  let defaultBlogContent = "Hi this is my blogg! "
  let defaultPrimaryCost = "0.0001"
  let defaultSecondaryCost = "0.00002"

  beforeEach(async () => {
    if (!developmentChains.includes(network.name)) {
      throw "You need to be on a development chain to run tests"
    }
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    account2 = accounts[1]
    await deployments.fixture(["all"])
    blog = await ethers.getContract("Blog")
  })

  describe("constructor", function () {
    it("the developer of the SC is recorded correctly", async () => {
      const response = await blog.getPlatformDeveloper()
      assert.equal(response, deployer.address)
    })
  })

  describe("Blogging", function () {
    it("Posting fails if you don't send enough ETH for primaryCost", async () => {
      await expect(blog.addBlog(defaultBlogContent)).to.be.revertedWith(
        "Blog__NotEnoughPrimaryCost"
      )
    })

    it("Updates the amount funded successfully when posting a blog with enough ETH", async () => {
      await blog.addBlog(defaultBlogContent, {
        value: ethers.utils.parseEther(defaultPrimaryCost),
        gasLimit: 1000000,
      })

      const response = await blog.getTotalFundedEntireHistory()

      // const response = await blog.getAmountFundedByAddress(deployer.address)

      assert.equal(
        response.toString(),
        ethers.utils.parseEther(defaultPrimaryCost).toString()
      )
    })

    it("Edit fails if you send 0 ETH for secondaryCost", async () => {
      await expect(
        blog.editBlogWithIndex(1, defaultBlogContent + "2")
      ).to.be.revertedWith("Blog__NotEnoughSecondaryCost")
    })

    it("Edit fails if you don't send enough ETH for secondaryCost", async () => {
      await expect(
        blog.editBlogWithIndex(1, defaultBlogContent + "2", {
          value: ethers.utils.parseEther("0.000019"),
          gasLimit: 1000000,
        })
      ).to.be.revertedWith("Blog__NotEnoughSecondaryCost")
    })

    it("Edit a post successfully", async () => {
      await blog.addBlog(defaultBlogContent, {
        value: ethers.utils.parseEther(defaultPrimaryCost),
        gasLimit: 1000000,
      })

      await blog.editBlogWithIndex(0, defaultBlogContent + "2", {
        value: ethers.utils.parseEther(defaultSecondaryCost),
        gasLimit: 1000000,
      })

      const editedPost = await blog.getABlogPost(deployer.address, 0)
      assert.equal(editedPost, defaultBlogContent + "2")
    })

    it("Post multiple posts", async () => {
      const postsByDeployer = 5
      for (let i = 0; i < postsByDeployer; i++) {
        await blog.addBlog(defaultBlogContent + i.toString(), {
          value: ethers.utils.parseEther(defaultPrimaryCost),
          gasLimit: 1000000,
        })
      }

      const postsByAccount2 = 3
      const blogConnectedTo2ndAccount = await blog.connect(account2)
      for (let i = 0; i < postsByAccount2; i++) {
        await blogConnectedTo2ndAccount.addBlog(
          defaultBlogContent + i.toString(),
          {
            value: ethers.utils.parseEther(defaultPrimaryCost),
            gasLimit: 1000000,
          }
        )
      }

      // check count
      assert.equal(
        (await blog.getBlogPostCount(deployer.address)).toString(),
        postsByDeployer.toString()
      )
      assert.equal(
        (await blog.getBlogPostCount(account2.address)).toString(),
        postsByAccount2.toString()
      )

      // check posts array length
      assert.equal(
        (await blog.getBlogPosts(deployer.address)).length.toString(),
        postsByDeployer.toString()
      )
      assert.equal(
        (await blog.getBlogPosts(account2.address)).length.toString(),
        postsByAccount2.toString()
      )

      // check mountFundedByAddress
      assert.equal(
        (await blog.getAmountFundedByAddress(deployer.address)).toString(),
        ethers.utils
          .parseEther(defaultPrimaryCost)
          .mul(postsByDeployer)
          .toString()
      )
      assert.equal(
        (await blog.getAmountFundedByAddress(account2.address)).toString(),
        ethers.utils
          .parseEther(defaultPrimaryCost)
          .mul(postsByAccount2)
          .toString()
      )

      // check total revenue
      const totalRevenue = ethers.utils
        .parseEther(defaultPrimaryCost)
        .mul(postsByAccount2 + postsByDeployer)
        .toString()
      assert.equal((await blog.getCurrentBalance()).toString(), totalRevenue)
      assert.equal(
        (await blog.getTotalFundedEntireHistory()).toString(),
        totalRevenue
      )
    })
  })

  describe("Withdraw", async () => {
    const sendAmount = ethers.utils.parseEther("0.05")
    let startingBlogBalance: BigNumber
    let startingDeployerBalance: BigNumber

    beforeEach(async () => {
      // send some ETH to Blog SC
      await deployer.sendTransaction({
        to: blog.address,
        value: sendAmount,
      })

      startingBlogBalance = await blog.getCurrentBalance()
      startingDeployerBalance = await blog.provider.getBalance(deployer.address)
    })

    it("Initial SC balance equals sendAmount", async () => {
      assert.equal(
        (await blog.getCurrentBalance()).toString(),
        sendAmount.toString()
      )
    })

    it("Withdraw all", async () => {
      const transactionResponse = await blog["withdraw()"]()
      const transactionReceipt = await transactionResponse.wait()
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingblogBalance = await blog.provider.getBalance(blog.address)
      const endingDeployerBalance = await blog.provider.getBalance(
        deployer.address
      )

      // Assert
      assert.equal(endingblogBalance.toString(), "0")
      assert.equal(
        startingBlogBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      )
      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingDeployerBalance.add(sendAmount).toString()
      )
    })

    it("Over-withdraw", async () => {
      const tooMuchEth = ethers.utils.parseEther("100")
      await expect(blog["withdraw(uint256)"](tooMuchEth)).to.be.revertedWith(
        "Blog__NotEnoughBalance"
      )
    })

    it("Withdraw partially", async () => {
      const someAmountOfEth = ethers.utils.parseEther("0.022")
      const transactionResponse = await blog["withdraw(uint256)"](
        someAmountOfEth
      )
      const transactionReceipt = await transactionResponse.wait()
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingblogBalance = await blog.provider.getBalance(blog.address)
      const endingDeployerBalance = await blog.provider.getBalance(
        deployer.address
      )

      // Assert
      assert.equal(
        endingblogBalance.toString(),
        sendAmount.sub(someAmountOfEth).toString()
      )
      assert.equal(
        endingDeployerBalance
          .add(gasCost)
          .sub(startingDeployerBalance)
          .toString(),
        someAmountOfEth.toString(),
        "Deployer balance difference before and after partial withdrawal should equal the withdrawal amount"
      )
    })

    it("Unauthorised to withdraw", async () => {
      const blogConnectedTo2ndAccount = await blog.connect(account2)

      await expect(
        blogConnectedTo2ndAccount["withdraw()"]()
      ).to.be.revertedWith("Blog__NotPlatformDeveloper")

      await expect(
        blogConnectedTo2ndAccount["withdraw(uint256)"](
          ethers.utils.parseEther("0.00001")
        )
      ).to.be.revertedWith("Blog__NotPlatformDeveloper")
    })
  })

  describe("Change cost", () => {
    it("Change primary cost", async () => {
      assert.equal(
        (await blog.getPrimaryCost()).toString(),
        ethers.utils.parseEther(defaultPrimaryCost).toString()
      )
      const newPrimaryCost = ethers.utils.parseEther("0.1")
      await blog.changePrimaryCost(newPrimaryCost)
      assert.equal(
        (await blog.getPrimaryCost()).toString(),
        newPrimaryCost.toString()
      )
    })

    it("Change secondary cost", async () => {
      assert.equal(
        (await blog.getSecondaryCost()).toString(),
        ethers.utils.parseEther(defaultSecondaryCost).toString()
      )
      const newSecondaryCost = ethers.utils.parseEther("0.1")
      await blog.changeSecondaryCost(newSecondaryCost)
      assert.equal(
        (await blog.getSecondaryCost()).toString(),
        newSecondaryCost.toString()
      )
    })

    it("Unauthorised to change cost", async () => {
      const blogConnectedTo2ndAccount = await blog.connect(account2)
      await expect(
        blogConnectedTo2ndAccount.changePrimaryCost(
          ethers.utils.parseEther("0.1")
        )
      ).to.be.revertedWith("Blog__NotPlatformDeveloper")
    })
  })
})
