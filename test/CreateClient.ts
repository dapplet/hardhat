// import deployments.json
import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
import hre from 'hardhat';
import deployments from '../deployments.json';
import { createBasicDiamond } from '../scripts/utils/createClient';

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

  let clients: string[] = [];

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

  it('Should get the baseplate', async function () {
    const baseplate = await dappsfacet.getBaseplate('basic');
    expect(baseplate).not.to.equal(ethers.constants.AddressZero);
  });

  it('Should createClient and register name successfully', async function () {
    const client = await createBasicDiamond(provider, signer[0]);
    console.log('clientDiamond:', client);
    clients.push(client);
  });

  it('Should have an owner', async function () {
    const x_ownerfacet = new Contract(
      clients[0],
      deployment['BasicDiamond'].abi,
      provider
    );
    const owner = await x_ownerfacet.owner();
    expect(owner).to.equal(signer[0].address);
  });
});
