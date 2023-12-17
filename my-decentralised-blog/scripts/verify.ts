import { BigNumber } from "ethers"
import { ethers, getNamedAccounts, deployments } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"

async function main() {
  const { deployer } = await getNamedAccounts()
  const blog = await ethers.getContract("Blog", deployer)
  await verify(blog.address, [networkConfig["sepolia"].ethUsdPriceFeed!])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
