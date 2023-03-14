// import deployments.json
import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
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
  let provider: ethers.providers.JsonRpcProvider;
  let signer: any[];
  let chainId: number;
  let deployment: IDeployment;

  let clientName: string;
  let clientdiamonds: string[] = [];

  let diamond: Contract;
  let dappsfacet: Contract;
  let dappletsfacet: Contract;

  before(async function () {
    [deployer, ...signer] = await hre.ethers.getSigners();
    provider = hre.ethers.provider;
    clientName = 'diamond' + (await deployer.getTransactionCount());
    chainId = await provider.getNetwork().then((n) => n.chainId);
    console.log('⛓️🆔', chainId);
    deployment = (deployments as IDeployments)[chainId as keyof IDeployments];

    const Diamond = deployment['Diamond'];
    diamond = new Contract(Diamond.address, Diamond.abi, provider);
    console.log('Diamond:', Diamond.address);

    const DappsFacet = deployment['DappsFacet'];
    dappsfacet = new Contract(Diamond.address, DappsFacet.abi, provider);
    console.log('ClientRegistry:', DappsFacet.address);

    const DappletsFacet = deployment['DappletsFacet'];
    dappletsfacet = new Contract(Diamond.address, DappletsFacet.abi, provider);
    console.log('dapplets:', DappletsFacet.address);

    const LoupeFacet = deployment['DiamondLoupeFacet'];
    const loupefacet = new Contract(Diamond.address, LoupeFacet.abi, provider);
    console.log('LoupeFacet:', LoupeFacet.address);

    const facets = await loupefacet.facetAddresses();
    console.log('facets:', facets);
    expect(facets).to.include(LoupeFacet.address);
  });

  it('Should createClient and register name successfully', async function () {
    const clientDiamond = await createClient(clientName, provider, signer[0]);
    clientdiamonds.push(clientDiamond);
  });

  it('Should resolve to clientName', async function () {
    const names = await dappsfacet.nameOf(clientdiamonds);
    console.log('clientName:', names[0]);
  });
});
