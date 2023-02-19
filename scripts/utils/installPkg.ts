// import deployments.json
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import deployments from '../../deployments.json';
import type { IDeployments } from '../../types';

export async function installPkg(
  hre: HardhatRuntimeEnvironment,
  clientAddress: string,
  pkgAddress: string,
  signer: SignerWithAddress,
  data: string
) {
  const chainId = await hre.ethers.provider
    .getNetwork()
    .then((network) => network.chainId);

  const deployment = (deployments as IDeployments)[
    chainId as keyof IDeployments
  ];

  const Installer = new Contract(
    clientAddress,
    deployment['Installer'].abi,
    hre.ethers.provider
  );

  const installPkg = await Installer.connect(signer).install(pkgAddress, data, {
    gasLimit: 1000000,
  });
  await installPkg.wait();

  const Connector = new Contract(
    deployment['Diamond'].address,
    deployment['ConnectorFacet'].abi,
    hre.ethers.provider
  );

  const events = await Connector.queryFilter('Upgrade');
  let pkgs = events.map((e) => e.args?.pkg);
  return pkgs[pkgs.length - 1];
}
