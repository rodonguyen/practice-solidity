import { BigNumber } from "ethers"
import { ethers, getNamedAccounts, deployments } from "hardhat"

async function main() {
  const { deployer } = await getNamedAccounts()
  console.log(`deployer: ${deployer}`)

  const blog = await ethers.getContract("Blog", deployer)
  console.log(`Got contract Blog at ${blog.address}`)

  console.log("getCurrentBalance()...")
  const transactionResponse: BigNumber = await blog.getCurrentBalance()
  // await transactionResponse.wait(1)
  console.log(`Current balance: ${transactionResponse.toNumber()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
