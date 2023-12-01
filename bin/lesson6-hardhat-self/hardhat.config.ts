import {HardhatUserConfig} from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'dotenv/config'

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KlY || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

const config: HardhatUserConfig = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {},
		sepolia: {
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY!],
			chainId: 11155111,
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
