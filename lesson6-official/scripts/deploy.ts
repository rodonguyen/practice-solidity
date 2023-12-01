import {ethers, run, network} from 'hardhat'
import * as fs from 'fs-extra'

async function main() {
	// We get the contract to deploy
	const SimpleStorageFactory = await ethers.getContractFactory('SimpleStorage')
	console.log('Deploying contract...')
	const simpleStorage = await SimpleStorageFactory.deploy()
	await simpleStorage.waitForDeployment()
	console.log('Simple Storage deployed to:', await simpleStorage.getAddress())

	// VERIFY ON A TESTNET! This will take a while
	// if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
	// 	setTimeout(async () => {
	// 		//do what you need here
	// 		try {
	// 			await simpleStorage.waitForDeployment()
	// 			await verify(await simpleStorage.getAddress(), [])
	// 		} catch {
	// 			console.log(
	// 				'Etherscan has not updated the contract in its database yet.',
	// 			)
	// 		}
	// 	}, 60000)
	// }

	// INTERACT WITH THE CONTRACT
	// Get the current value
	let currentValue = await simpleStorage.retrieve()
	console.log(`Current value: ${currentValue}`)

	// Update the value
	console.log('Updating contract...')
	let transactionResponse = await simpleStorage.store(9999)
	await transactionResponse.wait() // returns transaction receipt
	currentValue = await simpleStorage.retrieve()
	console.log(`Current value: ${currentValue}`)
}

const verify = async (contractAddress: string, args: any[]) => {
	console.log('Verifying contract...')
	try {
		await run('verify:verify', {
			address: contractAddress,
			constructorArguments: args,
		})
	} catch (e: any) {
		if (e.message.toLowerCase().includes('already verified')) {
			console.log('Already verified!')
		} else {
			console.log(e)
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
