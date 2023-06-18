import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import dotenv from 'dotenv';
import 'hardhat-abi-exporter';
import 'hardhat-dependency-compiler';
import 'hardhat-diamond-abi';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/config';
import 'tsconfig-paths/register';
import './tasks';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  // defaultNetwork: "mainnet",
  // defaultNetwork: 'sepolia',
  defaultNetwork: 'localhost',
  // defaultNetwork: 'hardhat',
  // defaultNetwork: 'ganache',
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL!,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY!,
        process.env.USER0_PRIVATE_KEY!,
        process.env.USER1_PRIVATE_KEY!,
      ],
    },
    localhost: {
      url: 'http://localhost:8545',
      chainId: 31337,
    },
    hardhat: {
      forking: {
        url: process.env.SEPOLIA_URL!,
      },
      accounts: [
        {
          privateKey: process.env.DEPLOYER_PRIVATE_KEY!,
          balance: '10000000000000000000000',
        },
        {
          privateKey: process.env.USER0_PRIVATE_KEY!,
          balance: '10000000000000000000000',
        },
        {
          privateKey: process.env.USER1_PRIVATE_KEY!,
          balance: '10000000000000000000000',
        },
      ],
      // throwOnTransactionFailures: true,
      // throwOnCallFailures: true,
      // hardfork: 'london',
    },
    ganache: {
      url: 'http://localhost:7545',
      chainId: 1337,
      blockGasLimit: 10000000,
    },
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
        'DappletsFacet',
        'DappsFacet',
        'DiamondCutFacet',
        'DiamondLoupeFacet',
        'ERC165Facet',
        'OperatorFacet',
        'OwnershipFacet',
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
        'BasicDiamond',
        'Installer',
        'PKG',
        'DappletsFacet',
        'DappsFacet',
        'DiamondCutFacet',
        'DiamondLoupeFacet',
        'ERC165Facet',
        'OperatorFacet',
        'OwnershipFacet',
        'Multicall2',
        'Initializer',
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
      only: [
        'BasicDiamond',
        'Installer',
        'PKG',
        'DappletsFacet',
        'DappsFacet',
        'DiamondCutFacet',
        'DiamondLoupeFacet',
        'ERC165Facet',
        'OperatorFacet',
        'OwnershipFacet',
        'Initializer',
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
  gasReporter: {
    enabled: true,
  },
};

export default config;
