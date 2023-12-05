import '@nomicfoundation/hardhat-toolbox'
import 'dotenv/config'
// import '@nomiclabs/hardhat-etherscan'
// import '@nomiclabs/hardhat-waffle'
import {task, HardhatUserConfig} from 'hardhat/config'
// import 'hardhat-gas-reporter'
// import("./tasks/block-number")
import './tasks/block-number'
// import 'solidity-coverage'
import '@typechain/hardhat'
// import '@nomiclabs/hardhat-ethers'

const SEPOLIA_RPC_URL =
	process.env.SEPOLIA_RPC_URL ||
	'https://eth-sepolia.g.alchemy.com/v2/THISISYOURAPIKEY'
const PRIVATE_KEY =
	process.env.PRIVATE_KEY || 'abc0example7531c263c1164d1afcb2b'
const COINMARKETCAP_API_KEY =
	process.env.COINMARKETCAP_API_KEY || '22example-51d1-42fa-8f1a-23d502aadefe'
const ETHERSCAN_API_KEY =
	process.env.ETHERSCAN_API_KEY || 'EXAMPLE00000000EV5ZAXN2MZKE71B7R'

const config: HardhatUserConfig = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {},
		sepolia: {
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY!],
			chainId: 11155111,
		},
		localhost: {
			url: 'http://127.0.0.1:8545/',
			chainId: 31337,
		},
	},
	solidity: '0.8.7',
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: true,
		currency: 'USD',
		outputFile: 'gas-report.txt',
		noColors: true,
		coinmarketcap: COINMARKETCAP_API_KEY,
	},
}

export default config
