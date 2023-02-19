// import deployments.json
import { expect } from 'chai';
import { Contract } from 'ethers';
import hre from 'hardhat';
import deployments from '../deployments.json';
import { createClient } from '../scripts/utils/createClient';

interface IDeployment {
  [key: string]: {
    address: string;
    abi?: any | null;
    cid?: string;
  };
}
interface IDeployments {
  [key: number]: IDeployment;
}

describe('CreateClient', async function () {
  let deployer: any;
  let signer: any[];
  let chainId: number;
  let deployment: IDeployment;

  let clientName: string;
  let clientdiamonds: string[] = [];

  let diamond: Contract;
  let clientregistry: Contract;
  let viewerfacet: Contract;
  let loupefacet: Contract;

  before(async function () {
    [deployer, ...signer] = await hre.ethers.getSigners();
    clientName = 'diamond' + (await deployer.getTransactionCount());
    chainId = await hre.ethers.provider.getNetwork().then((n) => n.chainId);
    console.log('⛓️🆔', chainId);
    deployment = (deployments as IDeployments)[chainId as keyof IDeployments];

    const Diamond = deployment['Diamond'];
    diamond = new Contract(Diamond.address, Diamond.abi, hre.ethers.provider);
    console.log('Diamond:', Diamond.address);

    const ClientRegistry = deployment['ClientRegistry'];
    clientregistry = new Contract(
      Diamond.address,
      ClientRegistry.abi,
      hre.ethers.provider
    );
    console.log('ClientRegistry:', ClientRegistry.address);

    const ViewerFacet = deployment['ViewerFacet'];
    viewerfacet = new Contract(
      Diamond.address,
      ViewerFacet.abi,
      hre.ethers.provider
    );
    console.log('ViewerFacet:', ViewerFacet.address);

    const LoupeFacet = deployment['DiamondLoupeFacet'];
    loupefacet = new Contract(
      Diamond.address,
      LoupeFacet.abi,
      hre.ethers.provider
    );
    console.log('LoupeFacet:', LoupeFacet.address);

    const facets = await loupefacet.facetAddresses();
    console.log('facets:', facets);
    expect(facets).to.include(LoupeFacet.address);
  });

  it('Should createClient and register name successfully', async function () {
    const clientDiamond = await createClient(hre, clientName, signer[0]);
    clientdiamonds.push(clientDiamond);
  });

  it('Should resolve to clientName', async function () {
    const names = await viewerfacet.nameOf(clientdiamonds);
    console.log('clientName:', names[0]);
  });
});
