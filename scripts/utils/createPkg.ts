// import deployments.json
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import deployments from '../../deployments.json';
import type { IDeployments, IPKGUpgrade } from '../../types';
import { costOf } from '../utils';

export async function createPkg(
  client: string,
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

  const BasicDiamond = new Contract(
    client,
    deployment['BasicDiamond'].abi,
    provider
  );

  const tx = await BasicDiamond.connect(account).create(cut, cid, {
    value: costOf.createPkg,
    gasLimit: 10000000,
  });
  const receipt = await tx.wait();

  const iface = new Interface(deployment['OperatorFacet'].abi);
  for (const log of receipt.logs) {
    const event = iface.parseLog(log);
    if (event.name === 'PackageCreated') {
      return event.args.pkg;
    }
  }
}
