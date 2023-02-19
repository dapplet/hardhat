// import deployments.json
import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { costOf } from '.';
import deployments from '../../deployments.json';
import type { IDeployments } from '../../types';

export async function createClient(
  hre: HardhatRuntimeEnvironment,
  name: string,
  signer?: SignerWithAddress
) {
  const chainId = await hre.ethers.provider
    .getNetwork()
    .then((network) => network.chainId);

  const deployment = (deployments as IDeployments)[
    chainId as keyof IDeployments
  ];

  const ClientRegistry = deployment['ClientRegistry'];
  const clientregistry = new hre.ethers.Contract(
    deployment['Diamond'].address,
    ClientRegistry.abi,
    hre.ethers.provider
  );

  const createClient = signer
    ? await clientregistry.connect(signer).createClient(name, {
        value: costOf.createClient,
        gasLimit: 1000000,
      })
    : await clientregistry.createClient(name, {
        value: costOf.createClient,
        gasLimit: 1000000,
      });
  const receipt = await createClient.wait();
  const clientDiamond = receipt.events?.find(
    (e: any) => e.event === 'RoleGranted'
  )?.args?.account;

  return clientDiamond;
}
