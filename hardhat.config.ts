import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-dependency-compiler';
import 'hardhat-diamond-abi';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';
import 'tsconfig-paths/register';
import './tasks';
dotenv.config();

// import tasks from './tasks';
// tasks();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  // defaultNetwork: 'localhost',
  defaultNetwork: 'sepolia',
  // defaultNetwork: 'goerli',
  // defaultNetwork: "mainnet",
  // defaultNetwork: 'hardhat',
  // defaultNetwork: 'ganache',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      chainId: 31337,
      blockGasLimit: 10000000,
    },
    ganache: {
      url: 'http://localhost:7545',
      chainId: 1337,
      blockGasLimit: 10000000,
    },
    hardhat: {
      forking: {
        url: process.env.INFURA_ETH_SEPOLIA_URL!,
      },
    },
    sepolia: {
      url: process.env.INFURA_ETH_SEPOLIA_URL!,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY!,
        process.env.USER0_PRIVATE_KEY!,
        process.env.USER1_PRIVATE_KEY!,
      ],
    },
    goerli: {
      url: process.env.INFURA_ETH_GOERLI_URL,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY!,
        process.env.USER0_PRIVATE_KEY!,
        process.env.USER1_PRIVATE_KEY!,
      ],
      blockGasLimit: 10000000,
      timeout: 5000000,
    },
    // mainnet: {
    //   url: process.env.INFURA_ETH_MAINNET_URL,
    //   accounts: [
    //     process.env.DEPLOYER_PRIVATE_KEY!,
    //     process.env.USER0_PRIVATE_KEY!,
    //     process.env.USER1_PRIVATE_KEY!,
    //   ],
    //   blockGasLimit: 5000000,
    //   timeout: 5000000,
    // },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 10000000,
  },
  diamondAbi: [
    {
      name: 'System',
      include: [
        'ERC165Facet',
        'OwnershipFacet',
        'DiamondLoupeFacet',
        'AdminFacet',
        'ClientRegistry',
        'ConnectorFacet',
        'DiamondCutFacet',
        'StakingFacet',
        'ViewerFacet',
      ],
      strict: false,
    },
  ],
  abiExporter: [
    {
      path: '../interface/src/contracts/metadata',
      runOnCompile: true,
      clear: true,
      flat: true,
      only: [
        'Installer',
        'PKG',
        'DiamondLoupeFacet',
        'ERC165Facet',
        'OwnershipFacet',
        'AdminFacet',
        'ClientRegistry',
        'ConnectorFacet',
        'DiamondCutFacet',
        'StakingFacet',
        'ViewerFacet',
        'Multicall2',
      ],
      // except: [],
      spacing: 2,
      pretty: false,
      format: 'json',
      filter: function (abiElement, index, fullAbi, fullyQualifiedName) {
        // if abiElement is already in the fullAbi, it's a duplicate, so don't include it
        return fullAbi.indexOf(abiElement) === index;
      },
    },
    {
      path: '../shell/src/contracts/metadata',
      runOnCompile: true,
      clear: true,
      flat: true,
      only: ['ConnectorFacet', 'ViewerFacet'],
      // except: [],
      spacing: 2,
      pretty: false,
      format: 'json',
      filter: function (abiElement, index, fullAbi, fullyQualifiedName) {
        // if abiElement is already in the fullAbi, it's a duplicate, so don't include it
        return fullAbi.indexOf(abiElement) === index;
      },
    },
    {
      path: '../template/imported/metadata',
      runOnCompile: true,
      clear: true,
      flat: true,
      only: ['ConnectorFacet', 'ViewerFacet'],
      // except: [],
      spacing: 2,
      pretty: false,
      format: 'json',
      filter: function (abiElement, index, fullAbi, fullyQualifiedName) {
        // if abiElement is already in the fullAbi, it's a duplicate, so don't include it
        return fullAbi.indexOf(abiElement) === index;
      },
    },
  ],
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY!,
      goerli: process.env.ETHERSCAN_API_KEY!,
      // optimisticEthereum: "YOUR_OPTIMISTIC_ETHERSCAN_API_KEY",
      // arbitrumOne: "YOUR_ARBISCAN_API_KEY",
    },
  },
  dependencyCompiler: {
    paths: ['@ensdomains/ens/contracts/ENS.sol'],
  },
};

export default config;