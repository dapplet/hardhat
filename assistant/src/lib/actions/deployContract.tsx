import { ethers } from 'ethers';
import { IFacetCut, LocalInitializer } from '../types';

export async function deployContract(
  artifact: { abi: any[]; bytecode: string },
  signer: ethers.providers.JsonRpcSigner,
  args: any[]
) {
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );
  const contract = await factory.deploy(...args);
  await contract.deployed();
  return contract;
}

export async function deployFacet(
  facet: any,
  signer: ethers.providers.JsonRpcSigner
) {
  let cut: IFacetCut = {
    target: ethers.constants.AddressZero,
    action: 0,
    selectors: [],
  };
  let selectors: string[] = [];
  const bytecode = facet.bytecode;
  const abi = facet.abi;
  const fns = facet.functions;
  const constructorArgs = facet.constructorArgs || [];
  const contract = await deployContract(
    { abi, bytecode },
    signer,
    constructorArgs
  );
  Object.keys(contract.interface.functions).forEach((fn: any) => {
    if (contract.interface.functions[fn]) {
      const sighash = contract.interface.getSighash(fn);
      selectors.push(sighash);
    }
  });
  contract &&
    (cut = {
      target: contract.address,
      action: 0,
      selectors,
    });
  return cut;
}

export async function deployInitializer(
  initializer: LocalInitializer,
  signer: ethers.providers.JsonRpcSigner
) {
  let selector: string = '0x00000000';
  let target: string = ethers.constants.AddressZero;

  const abi = initializer?.abi;
  const bytecode = initializer?.bytecode;
  const fn = initializer?.function;
  const constructorArgs = initializer?.constructorArgs || [];

  const contract = await deployContract(
    { abi, bytecode },
    signer,
    constructorArgs
  );

  if (contract.interface.functions[fn]) {
    selector = contract.interface.getSighash(fn);
    target = contract.address;
  }

  return { selector, target };
}
