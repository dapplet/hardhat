import { Contract, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { costOf } from '../constants';
import { Installer__factory, OperatorFacet__factory } from '../contracts/types';
import type { IPKGCUT } from '../types';

export async function createPkg(
  client: string,
  cut: IPKGCUT,
  cid: string,
  signer: ethers.providers.JsonRpcSigner
) {
  const Installer = new Contract(client, Installer__factory.abi, signer);
  const tx = await Installer.create(cut, cid, {
    value: costOf.createPkg,
    gasLimit: 1000000,
  });
  const receipt = await tx.wait();
  const iface = new Interface(OperatorFacet__factory.abi);

  for (const log of receipt.logs) {
    const event = iface.parseLog(log);
    if (event.name === 'PackageCreated') {
      return event.args.pkg;
    }
  }

  // for (const log of receipt.logs) {
  //   if (iface.parseLog(log).name === 'PackageCreated') {
  //     const event = iface.parseLog(log);
  //     return event.args.pkg;
  //   }
  // }
}
