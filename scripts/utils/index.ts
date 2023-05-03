import { Contract, ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import deployments from '../../deployments.json';
import { IFacetCut } from '../../types';

export const costOf = {
  createPkg: ethers.utils.parseEther('0.01'),
  createClient: ethers.utils.parseEther('0.01'),
  install: ethers.utils.parseEther('0.001'),
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
