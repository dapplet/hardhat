// import deployments.json
import { Contract, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { costOf } from '../constants';
import { Installer__factory, OperatorFacet__factory } from '../contracts/types';

export async function installPkg(
  client: string,
  pkg: string,
  signer: ethers.providers.JsonRpcSigner,
  data?: string
) {
  const Installer = new Contract(client, Installer__factory.abi, signer);
  console.log('Installer', Installer);
  const tx = await Installer.install(pkg, data, {
    value: costOf.install,
    gasLimit: 1000000,
  });
  console.log('tx', tx);
  const receipt = await tx.wait();
  console.log('receipt', receipt);
  const iface = new Interface(OperatorFacet__factory.abi);
  for (const log of receipt.logs) {
    const event = iface.parseLog(log);
    console.log('event', event);
    if (event.name === 'ClientUpgraded') {
      if (event.args.pkg === pkg) {
        return true;
      } else {
        throw new Error('ClientUpgraded event pkg does not match');
      }
    }
  }
}

export async function uninstallPkg(
  client: string,
  pkg: string,
  signer: ethers.providers.JsonRpcSigner,
  data?: string
) {
  const Installer = new Contract(client, Installer__factory.abi, signer);
  console.log('Installer', Installer);
  const tx = await Installer.uninstall(pkg, data, {
    gasLimit: 1000000,
  });
  console.log('tx', tx);
  const receipt = await tx.wait();
  console.log('receipt', receipt);
  const iface = new Interface(OperatorFacet__factory.abi);
  for (const log of receipt.logs) {
    const event = iface.parseLog(log);
    if (event.name === 'ClientUpgraded') {
      if (event.args.pkg === pkg) {
        return true;
      } else {
        throw new Error('ClientUpgraded event pkg does not match');
      }
    }
  }
}
