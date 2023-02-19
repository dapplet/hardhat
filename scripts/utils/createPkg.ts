// import deployments.json
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import deployments from '../../deployments.json';
import type { IDeployments, IPKGCUT } from '../../types';
import { costOf } from '../utils';
import { createClient } from './createClient';
import { installPkg } from './installPkg';

export async function createPkg(
  hre: HardhatRuntimeEnvironment,
  clientAddress: string,
  cut: IPKGCUT,
  cid: string,
  signer?: SignerWithAddress
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

  const createPkg = signer
    ? await Installer.connect(signer).create(cut, cid, {
        value: costOf.createPkg,
        gasLimit: 1000000,
      })
    : await Installer.create(cut, cid, {
        value: costOf.createPkg,
        gasLimit: 1000000,
      });
  await createPkg.wait();

  const Connector = new Contract(
    deployment['Diamond'].address,
    deployment['ConnectorFacet'].abi,
    hre.ethers.provider
  );

  const events = await Connector.queryFilter('PackageCreated');
  let pkgs = events.map((e) => e.args?.pkg);
  return pkgs[pkgs.length - 1];
}

export async function createPkgFromRoot(
  hre: HardhatRuntimeEnvironment,
  signerAddress?: string,
  clientName?: string,
  cid?: string,
  data?: string
) {
  const signer: SignerWithAddress = signerAddress
    ? await hre.ethers.getSigner(signerAddress)
    : ((await hre.ethers.getSigners())?.[0] as SignerWithAddress);

  // get cwd
  const cwd = process.cwd();
  const packageJson = require(`${cwd}/package.json`);
  const { custom } = packageJson;
  const pkg: IPKGCUT = custom;

  const clientAddress = await createClient(
    hre,
    clientName || `${packageJson.name}-devenv`,
    signer
  );

  cid = cid || 'bafkreibqxnhdkj4eihg4klptqsaw6ckdnhqtlv4lylwcopgylmqf5npiyq';

  const pkgAddress = await createPkg(hre, clientAddress, pkg, cid, signer);

  console.log('📦', pkgAddress);
  /// now cut pkg into diamond
  const installedPkg = await installPkg(
    hre,
    clientAddress,
    pkgAddress,
    signer,
    data || '0x'
  );

  /* 
    hre: HardhatRuntimeEnvironment,
  clientAddress: string,
  pkg: IPKGCUT,
  signer: SignerWithAddress,
  data: string
  
  
  */
  console.log('🔪', installedPkg);
}
