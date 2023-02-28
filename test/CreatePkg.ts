// import deployments.json
import { expect } from 'chai';
import { Contract } from 'ethers';
import hre, { ethers, run } from 'hardhat';
import deployments from '../deployments.json';
import { costOf, createAddFacetCut } from '../scripts/utils';
import { createClient } from '../scripts/utils/createClient';
import { createPkg } from '../scripts/utils/createPkg';
import { PKG__factory } from '../typechain-types';
import type { IDeployment, IDeployments, IPKGCUT } from '../types';
const PKGInterface = new ethers.utils.Interface(PKG__factory.abi);

describe('CreatePkg', async function () {
  let deployer: any;
  let signer: any[];
  let chainId: number;
  let deployment: IDeployment;

  let clientAddress: string; //address of client
  let clientName: string;
  let clientdiamonds: string[] = [];

  let diamond: Contract;
  let clientregistry: Contract;
  let stakingfacet: Contract;
  let installer: Contract;
  let connectorfacet: Contract;
  let clientloupefacet: Contract;
  let viewerfacet: Contract;
  let greeterinit: Contract;

  let pkgs: string[];
  let counterPkg: string, greeterPkg: string;

  before(async function () {
    [deployer, ...signer] = await ethers.getSigners();
    clientName = 'client' + (await signer[0].getTransactionCount());
    console.log('clientName:', clientName);
    chainId = await ethers.provider.getNetwork().then((n) => n.chainId);
    console.log('⛓️🆔', chainId);
    deployment = (deployments as IDeployments)[chainId as keyof IDeployments];

    const Diamond = deployment['Diamond'];
    diamond = new Contract(Diamond.address, Diamond.abi, ethers.provider);

    const ClientRegistry = deployment['ClientRegistry'];
    clientregistry = new Contract(
      Diamond.address,
      ClientRegistry.abi,
      ethers.provider
    );

    clientAddress = await createClient(hre, clientName, signer[1]);

    const StakingFacet = deployment['StakingFacet'];
    stakingfacet = new Contract(
      Diamond.address,
      StakingFacet.abi,
      ethers.provider
    );

    const Installer = deployment['Installer'];
    installer = new Contract(clientAddress, Installer.abi, ethers.provider);

    const ConnectorFacet = deployment['ConnectorFacet'];
    connectorfacet = new Contract(
      Diamond.address,
      ConnectorFacet.abi,
      ethers.provider
    );

    const LoupeFacet = deployment['DiamondLoupeFacet'];
    clientloupefacet = new Contract(
      clientAddress,
      LoupeFacet.abi,
      ethers.provider
    );

    const ViewerFacet = deployment['ViewerFacet'];
    viewerfacet = new Contract(
      Diamond.address,
      ViewerFacet.abi,
      ethers.provider
    );
  });

  // it('should create a pkg', async function () {
  //   await createPkgFromRoot(hre, signer[0].address, `${clientName}999`);
  // });

  it('should create counter package', async function () {
    const Counter = await ethers.getContractFactory('Counter');
    const counter = await Counter.deploy();
    await counter.deployed();
    console.log('Counter deployed to:', counter.address);
    await run('verify:sourcify', {
      name: 'Counter',
      address: counter.address,
      chainid: chainId,
    });
    const pkg: IPKGCUT = {
      cuts: createAddFacetCut([counter]),
      target: '0x0000000000000000000000000000000000000000',
      selector: '0x00000000',
    };
    const cid = 'bafkreibqxnhdkj4eihg4klptqsaw6ckdnhqtlv4lylwcopgylmqf5npiyq';
    counterPkg = await createPkg(hre, clientAddress, pkg, cid, signer[1]);
  });

  it('should create greeter package', async function () {
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy();
    await greeter.deployed();
    console.log('Greeter deployed to:', greeter.address);
    await run('verify:sourcify', {
      name: 'Greeter',
      address: greeter.address,
      chainid: chainId,
    });

    const GreeterInit = await ethers.getContractFactory('GreeterInit');
    greeterinit = await GreeterInit.deploy(deployer.address);
    await greeterinit.deployed();
    console.log('GreeterInit deployed to:', greeterinit.address);
    await run('verify:sourcify', {
      name: 'GreeterInit',
      address: greeterinit.address,
      chainid: chainId,
    });

    const pkg: IPKGCUT = {
      cuts: createAddFacetCut([greeter]),
      target: greeterinit.address,
      selector: greeterinit.interface.getSighash('init(string)'),
    };
    const cid = 'bafkreihxqlswwk7htltdez2ekldymmx7lo5d6t7s34tiojdygd4cbc6i6e';

    greeterPkg = await createPkg(hre, clientAddress, pkg, cid, signer[1]);
  });

  /* event Upgrade (address indexed pkg, address indexed client, bool install); */
  it('should view packages from events', async function () {
    const events = await connectorfacet.queryFilter('PackageCreated');
    pkgs = events.map((e) => e.args?.pkg);

    // get metadataOf(pkg)
    const metadata = await viewerfacet.metadataOf(pkgs);
    console.log('📦 metadata', metadata);

    counterPkg = pkgs[pkgs.length - 2];
    greeterPkg = pkgs[pkgs.length - 1];
  });

  it('should stake on a package', async function () {
    const assetAmount = ethers.utils.parseEther('0.1');

    const before = await stakingfacet.balanceOf(counterPkg);

    // stake 0.001 WETH
    const tx = await stakingfacet.connect(signer[1]).stake(counterPkg, {
      value: assetAmount,
      gasLimit: 1000000,
    });
    const receipt = await tx.wait();
    const evts = receipt.events.filter((e: any) => e.event == 'Stake');
    expect(evts[0].args.account).to.equal(signer[1].address);

    // check balance
    const after = await stakingfacet.balanceOf(counterPkg);
    expect(after.sub(before)).to.equal(assetAmount);
  });

  it('should install a package to a diamond', async function () {
    const before = await clientloupefacet.facetAddresses();

    // send install(counterPkg, bytes(0))

    const counterInstall = await installer
      .connect(signer[1])
      .install(counterPkg, '0x', {
        gasLimit: 1000000,
        value: costOf.install,
      });
    await counterInstall.wait();

    const after = await clientloupefacet.facetAddresses();

    expect(before.length).to.be.lessThan(after.length);
  });

  it('should allow user to send custom params, and owner to set cost to install', async function () {
    const before = await ethers.provider.getBalance(deployer.address);

    // pass functioncall as bytes -- init(string memory), where string is 'Hello, world!'
    const calldata = greeterinit.interface.encodeFunctionData('init(string)', [
      'Hello, world!',
    ]);

    const greeterInstall = await installer
      .connect(signer[1])
      .install(greeterPkg, calldata, {
        gasLimit: 1000000,
        value: ethers.utils.parseEther('1'),
      });
    await greeterInstall.wait();

    const after = await ethers.provider.getBalance(deployer.address);

    expect(after).to.be.greaterThan(before);
  });

  it('should uninstall a package from a diamond', async function () {
    const before = await clientloupefacet.facetAddresses();

    const uninstall = await installer
      .connect(signer[1])
      .uninstall(greeterPkg, '0x', {
        gasLimit: 1000000,
        value: costOf.install,
      });
    await uninstall.wait();

    const after = await clientloupefacet.facetAddresses();

    expect(before.length).to.be.greaterThan(after.length);
  });

  it('should check stake increased', async function () {
    const pkg = new Contract(counterPkg, PKGInterface, ethers.provider);

    const before = await ethers.provider.getBalance(signer[1].address);

    const beforePkgBalanceOf = await pkg.balanceOf(signer[1].address);

    const amount = await pkg.maxRedeem(signer[1].address);

    const preview = await pkg.previewRedeem(amount);

    const tx = await stakingfacet
      .connect(signer[1])
      .unstake(counterPkg, amount);
    const receipt = await tx.wait();
    const gas = receipt.gasUsed.mul(tx.gasPrice);
    const evts = receipt.events.filter((e: any) => e.event == 'Unstake');
    expect(evts[0].args.account).to.equal(signer[1].address);

    const after = await ethers.provider.getBalance(signer[1].address);

    const afterPkgBalanceOf = await pkg.balanceOf(signer[1].address);

    expect(after.sub(before)).to.equal(preview.sub(gas));

    expect(beforePkgBalanceOf.sub(afterPkgBalanceOf)).to.equal(amount);
  });
});
