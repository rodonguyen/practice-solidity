import { run } from "hardhat"

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...")
  try {
    setTimeout(async () => {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      })
    }, 60000)
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

export default verify
