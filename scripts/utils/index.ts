import { BytesLike, Contract, ethers } from 'ethers';
import { promises } from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import deployments from '../../deployments.json';
import { IFacetCut } from '../../types';

export const costOf = {
  createPkg: ethers.utils.parseEther('0.001'),
  createClient: ethers.utils.parseEther('0.01'),
  install: ethers.utils.parseEther('0.0001'),
};

const action = { add: 0, replace: 1, remove: 2 };

export function createAddFacetCut(contracts: Contract[]) {
  let cuts = [];
  for (const contract of contracts) {
    cuts.push({
      target: contract.address,
      action: action.add,
      selectors: Object.keys(contract.interface.functions)
        // .filter((fn) => fn != 'init()')
        .map((fn) => contract.interface.getSighash(fn)),
    });
  }
  return cuts as IFacetCut[];
}

export function createRemoveFacetCut(contracts: Contract[]) {
  let cuts = [];
  for (const contract of contracts) {
    cuts.push({
      target: ethers.constants.AddressZero,
      action: action.remove,
      selectors: Object.keys(contract.interface.functions)
        // .filter((fn) => fn != 'init()')
        .map((fn) => contract.interface.getSighash(fn)),
    });
  }
  return cuts;
}

export async function recompile(hre: HardhatRuntimeEnvironment) {
  await hre.run('clean');
  await hre.run('compile');
}

async function getBuildInfo() {
  const path = 'artifacts/build-info';
  const dir = await promises.readdir(path);
  const file = await promises.readFile(`${path}/${dir[0]}`);
  const buildInfo = JSON.parse(file.toString());
  return buildInfo;
}

export function getEnsAddressByChainId(chainId: number) {
  switch (chainId) {
    // mainnet
    case 1:
      return '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    // goerli
    case 5:
      return '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    // optimism
    case 10:
      throw 'utils: ENS not yet supported on Optimism';
    // arbitrum
    case 42161:
      throw 'utils: ENS not yet supported on Arbitrum';
    // or throw error
    default:
      throw 'utils: add ENS address for chainId';
  }
}

export async function deployDummyENSRegistry(
  hre: HardhatRuntimeEnvironment,
  topNode: BytesLike,
  rootNode: BytesLike
) {
  const Registry = await hre.ethers.getContractFactory('DummyRegistry');
  const registry = await Registry.deploy(topNode, rootNode);
  await registry.deployed();
  console.log('DummyRegistry deployed to:', registry.address);
  return registry;
}

export interface IDeployments {
  [key: number]: {
    [key: string]: {
      address: string;
      abi?: any;
    };
  };
}

export function deployment(contractName: string, chainId: number) {
  return (deployments as IDeployments)[chainId as keyof IDeployments]?.[
    contractName
  ];
}
