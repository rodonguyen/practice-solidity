import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../utils/verify"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const deployBlog: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("----------------------------------------------------")
  log("Deploying BLOG and waiting for confirmations...")
  const blog = await deploy("Blog", {
    from: deployer,
    // args: [ethUsdPriceFeedAddress],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
  })
  log(`Blog deployed at ${blog.address}`)

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // await verify(blog.address, [])
  }
}
export default deployBlog
deployBlog.tags = ["all", "blog"]

// // With MockV3Aggregator / OLDER VERSION

// const deployBlog: DeployFunction = async function (
//   hre: HardhatRuntimeEnvironment
// ) {
//   // @ts-ignore
//   const { getNamedAccounts, deployments, network } = hre
//   const { deploy, log } = deployments
//   const { deployer } = await getNamedAccounts()
//   const chainId: number = network.config.chainId!

//   let ethUsdPriceFeedAddress: string
//   if (chainId == 31337) {
//     const ethUsdAggregator = await deployments.get("MockV3Aggregator")
//     ethUsdPriceFeedAddress = ethUsdAggregator.address
//   } else {
//     ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
//   }

//   log("----------------------------------------------------")
//   log("Deploying BLOG and waiting for confirmations...")
//   const blog = await deploy("Blog", {
//     from: deployer,
//     args: [ethUsdPriceFeedAddress],
//     log: true,
//     // we need to wait if on a live network so we can verify properly
//     waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
//   })
//   log(`Blog deployed at ${blog.address}`)

//   if (
//     !developmentChains.includes(network.name) &&
//     process.env.ETHERSCAN_API_KEY
//   ) {
//     await verify(blog.address, [ethUsdPriceFeedAddress])
//   }
// }
// export default deployBlog
// deployBlog.tags = ["all", "blog"]
