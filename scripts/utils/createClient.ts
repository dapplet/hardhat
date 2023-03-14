// import deployments.json
import { ethers } from 'ethers';
import { costOf } from '.';
import deployments from '../../deployments.json';
import type { IDeployments } from '../../types';

export async function createClient(
  name: string,
  provider: ethers.providers.JsonRpcProvider,
  signer?: ethers.providers.JsonRpcSigner
) {
  const chainId = await provider
    .getNetwork()
    .then((network) => network.chainId);

  const account = signer ? signer : provider.getSigner();

  const deployment = (deployments as IDeployments)[
    chainId as keyof IDeployments
  ];

  const Dapps = deployment['DappsFacet'];
  const x_dapps = new ethers.Contract(
    deployment['Diamond'].address,
    Dapps.abi,
    provider
  );

  const tx = await x_dapps.connect(account).createClient(name, {
    value: costOf.createClient,
    gasLimit: 1000000,
  });
  const receipt = await tx.wait();
  const dappAddr = receipt.events?.find((e: any) => e.event === 'RoleGranted')
    ?.args?.account;

  return dappAddr;
}
