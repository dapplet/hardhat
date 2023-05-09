// import deployments.json
import { Contract, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import deployments from '../../deployments.json';
import type { IDeployments } from '../../types';

export async function installPkg(
  clientAddress: string,
  pkgAddress: string,
  provider: ethers.providers.JsonRpcProvider,
  signer: ethers.providers.JsonRpcSigner,
  data: string
) {
  const chainId = await provider
    .getNetwork()
    .then((network) => network.chainId);

  const account = signer ? signer : provider.getSigner();

  const deployment = (deployments as IDeployments)[
    chainId as keyof IDeployments
  ];

  const Installer = new Contract(
    clientAddress,
    deployment['Installer'].abi,
    provider
  );

  const tx = await Installer.connect(account).install(pkgAddress, data, {
    gasLimit: 1000000,
  });
  const receipt = await tx.wait();

  const iface = new Interface(deployment['OperatorFacet'].abi);
  for (const log of receipt.logs) {
    const event = iface.parseLog(log);
    if (event.name === 'ClientUpgraded') {
      return event.args.pkg;
    }
  }
}
