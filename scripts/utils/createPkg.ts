// import deployments.json
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import deployments from '../../deployments.json';
import type { IDeployments, IPKGUpgrade } from '../../types';
import { costOf } from '../utils';
import { createClient } from './createClient';
import { installPkg } from './installPkg';

export async function createPkg(
  clientAddress: string,
  cut: IPKGUpgrade,
  cid: string,
  provider: ethers.providers.JsonRpcProvider,
  signer?: SignerWithAddress
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

  const tx = await Installer.connect(account).create(cut, cid, {
    value: costOf.createPkg,
    gasLimit: 1000000,
  });
  const receipt = await tx.wait();

  const iface = new Interface(deployment['ConnectorFacet'].abi);
  for (const log of receipt.logs) {
    const event = iface.parseLog(log);
    if (event.name === 'PackageCreated') {
      return event.args.pkg;
    }
  }
}

export async function createPkgFromRoot(
  provider: ethers.providers.JsonRpcProvider,
  signer?: ethers.providers.JsonRpcSigner,
  clientName?: string,
  cid?: string,
  data?: string
) {
  // get cwd
  const cwd = process.cwd();
  const packageJson = require(`${cwd}/package.json`);
  const { custom } = packageJson;
  const pkg: IPKGUpgrade = custom;

  const account = signer ? signer : provider.getSigner();

  const clientAddress = await createClient(
    clientName || `${packageJson.name}-dev`,
    provider
  );

  cid = cid || 'bafkreibqxnhdkj4eihg4klptqsaw6ckdnhqtlv4lylwcopgylmqf5npiyq';

  const pkgAddress = await createPkg(clientAddress, pkg, cid, provider);

  console.log('📦', pkgAddress);
  /// now cut pkg into diamond
  const installedPkg = await installPkg(
    clientAddress,
    pkgAddress,
    provider,
    account,
    data || '0x'
  );
  console.log('🔪', installedPkg);
}
