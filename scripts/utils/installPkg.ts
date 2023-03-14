// import deployments.json
import { Contract, ethers } from 'ethers';
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

  const installPkg = await Installer.connect(account).install(
    pkgAddress,
    data,
    {
      gasLimit: 1000000,
    }
  );
  await installPkg.wait();

  const ConnectorFacet = new Contract(
    deployment['Diamond'].address,
    deployment['ConnectorFacet'].abi,
    provider
  );

  const events = await ConnectorFacet.queryFilter('Upgrade');
  let pkgs = events.map((e) => e.args?.pkg);
  return pkgs[pkgs.length - 1];
}
