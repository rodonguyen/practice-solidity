import { ethers, getNamedAccounts, deployments } from "hardhat"

async function main() {
  const { deployer } = await getNamedAccounts()
  console.log(`deployer: ${deployer}`)

  const blog = await ethers.getContract("Blog", deployer)
  console.log(`Got contract Blog at ${blog.address}`)

  const networkGasLimit = (await ethers.provider.getBlock("latest")).gasLimit
  const gasLimitPercentage = 1
  const gasLimit = Math.floor(networkGasLimit.toNumber() * gasLimitPercentage)

  console.log("Write a blog...")
  const blogContent = "# HELLO WORLD\nhi this is my first blog 2"
  const transactionResponse = await blog.addBlog(blogContent, {
    value: ethers.utils.parseEther("0.001"),
    gasLimit: gasLimit, // 1000000 is ok
  })
  await transactionResponse.wait()
  console.log("Posted a blog")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
