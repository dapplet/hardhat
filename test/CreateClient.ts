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

  let clientdiamonds: string[] = [];

  let diamond: Contract;
  let dappsfacet: Contract;
  let dappletsfacet: Contract;

  before(async function () {
    [deployer, ...signer] = await hre.ethers.getSigners();
    provider = hre.ethers.provider;
    chainId = await provider.getNetwork().then((n) => n.chainId);
    console.log('⛓️🆔', chainId);
    deployment = (deployments as IDeployments)[chainId as keyof IDeployments];

    const Diamond = deployment['Diamond'];
    diamond = new Contract(Diamond.address, Diamond.abi, provider);

    const DappsFacet = deployment['DappsFacet'];
    dappsfacet = new Contract(Diamond.address, DappsFacet.abi, provider);

    const DappletsFacet = deployment['DappletsFacet'];
    dappletsfacet = new Contract(Diamond.address, DappletsFacet.abi, provider);

    const LoupeFacet = deployment['DiamondLoupeFacet'];
    const loupefacet = new Contract(Diamond.address, LoupeFacet.abi, provider);

    const facets = await loupefacet.facetAddresses();
    expect(facets).to.include(LoupeFacet.address);
  });

  it('Should createClient and register name successfully', async function () {
    const clientDiamond = await createClient(provider, signer[0]);
    console.log('clientDiamond:', clientDiamond);
    clientdiamonds.push(clientDiamond);
  });

  it('Should have facets on client', async function () {
    const diamondloupefacet = new Contract(
      clientdiamonds[0],
      deployment['DiamondLoupeFacet'].abi,
      provider
    );
    const facets = await diamondloupefacet.facets();
    expect(facets.length).to.be.greaterThan(0);
  });
});
