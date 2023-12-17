import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers, getNamedAccounts, deployments } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"

async function main() {
  const { deployer } = await getNamedAccounts()
  // const signer = await ethers.provider.getSigner(deployer)
  console.log(`deployer: ${deployer}`)

  const blogDeployment = await deployments.get("Blog")
  const signers = await ethers.getSigners()
  const blog = await ethers.getContractAt(
    "Blog",
    blogDeployment.address,
    signers[0]
  )

  // const blog = await ethers.getc("Blog", deployer)
  console.log(`Got contract Blog at ${blog.address}`)

  console.log("getCurrentBalance()...")
  const transactionResponse = await blog.getCurrentBalance()
  await transactionResponse.wait()
  console.log("Posted a blog")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
