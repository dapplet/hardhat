// import deployments.json
import { ethers } from 'ethers';
import { costOf } from '.';
import deployments from '../../deployments.json';
import type { IDeployments } from '../../types';

export async function createBasicDiamond(
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

  const DappsFacet = deployment['DappsFacet'];
  const x_dapps = new ethers.Contract(
    deployment['Diamond'].address,
    DappsFacet.abi,
    provider
  );

  const basic_id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('basic'));
  console.log('basic_id:', basic_id);

  const tx = await x_dapps.connect(account).createClient(basic_id, {
    value: costOf.createClient,
    gasLimit: 1000000,
  });
  const receipt = await tx.wait();
  const dappAddr = receipt.events?.find((e: any) => e.event === 'RoleGranted')
    ?.args?.account;

  return dappAddr;
}
