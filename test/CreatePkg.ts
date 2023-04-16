// import deployments.json
import { expect } from 'chai';
import { Contract, ethers } from 'ethers';
import hre, { run } from 'hardhat';
import deployments from '../deployments.json';
import { costOf, createAddFacetCut } from '../scripts/utils';
import { createClient } from '../scripts/utils/createClient';
import { createPkg } from '../scripts/utils/createPkg';
import { PKG__factory } from '../typechain-types';
import type { IDeployment, IDeployments, IPKGUpgrade } from '../types';
const PKGInterface = new ethers.utils.Interface(PKG__factory.abi);

describe('CreatePkg', async function () {
  let deployer: any;
  let provider: ethers.providers.JsonRpcProvider;
  let signer: any[];
  let chainId: number;
  let deployment: IDeployment;

  let clientAddress: string; //address of client
  let clientdiamonds: string[] = [];

  let diamond: Contract;
  let dappsfacet: Contract;
  let dappletsfacet: Contract;
  let connectorfacet: Contract;
  let installer: Contract;
  let clientloupefacet: Contract;
  let greeterinit: Contract;

  let pkgs: string[];
  let visitorlogPkg: string,
    greeterPkg: string,
    counterPkg: string,
    favoriterPkg: string;

  before(async function () {
    [deployer, ...signer] = await hre.ethers.getSigners();
    provider = hre.ethers.provider;
    chainId = await provider.getNetwork().then((network) => network.chainId);
    console.log('⛓️🆔', chainId);
    deployment = (deployments as IDeployments)[chainId as keyof IDeployments];

    const Diamond = deployment['Diamond'];
    diamond = new Contract(Diamond.address, Diamond.abi, provider);

    const DappsFacet = deployment['DappsFacet'];
    dappsfacet = new Contract(Diamond.address, DappsFacet.abi, provider);

    clientAddress = await createClient(provider, signer[1]);

    const DappletsFacet = deployment['DappletsFacet'];
    dappletsfacet = new Contract(Diamond.address, DappletsFacet.abi, provider);

    const Installer = deployment['Installer'];
    installer = new Contract(clientAddress, Installer.abi, provider);

    const ConnectorFacet = deployment['ConnectorFacet'];
    connectorfacet = new Contract(
      Diamond.address,
      ConnectorFacet.abi,
      provider
    );

    const LoupeFacet = deployment['DiamondLoupeFacet'];
    clientloupefacet = new Contract(clientAddress, LoupeFacet.abi, provider);
  });

  it('should create visitor log package', async function () {
    const VisitorLog = await hre.ethers.getContractFactory('VisitorLog');
    const visitorlog = await VisitorLog.deploy();
    await visitorlog.deployed();
    console.log('VisitorLog deployed to:', visitorlog.address);
    await run('verify:sourcify', {
      name: 'VisitorLog',
      address: visitorlog.address,
      chainid: chainId,
    });

    const VisitorLogInit = await hre.ethers.getContractFactory(
      'VisitorLogInit'
    );
    const visitorloginit = await VisitorLogInit.deploy(deployer.address);
    await visitorloginit.deployed();
    console.log('VisitorLogInit deployed to:', visitorloginit.address);
    await run('verify:sourcify', {
      name: 'VisitorLogInit',
      address: visitorloginit.address,
      chainid: chainId,
    });

    const pkg: IPKGUpgrade = {
      cuts: createAddFacetCut([visitorlog]),
      target: visitorloginit.address,
      selector: visitorloginit.interface.getSighash('init'),
    };

    const cid = 'bafkreibbiwiulq4e4qwzb5cq4awiw2jhmyyaqb3l2upqr2ywfwp5iaa7um';
    visitorlogPkg = await createPkg(
      clientAddress,
      pkg,
      cid,
      provider,
      signer[1]
    );
  });

  it('should create greeter package', async function () {
    const Greeter = await hre.ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy();
    await greeter.deployed();
    console.log('Greeter deployed to:', greeter.address);
    await run('verify:sourcify', {
      name: 'Greeter',
      address: greeter.address,
      chainid: chainId,
    });

    const GreeterInit = await hre.ethers.getContractFactory('GreeterInit');
    greeterinit = await GreeterInit.deploy(deployer.address);
    await greeterinit.deployed();
    console.log('GreeterInit deployed to:', greeterinit.address);
    await run('verify:sourcify', {
      name: 'GreeterInit',
      address: greeterinit.address,
      chainid: chainId,
    });

    const pkg: IPKGUpgrade = {
      cuts: createAddFacetCut([greeter]),
      target: greeterinit.address,
      selector: greeterinit.interface.getSighash('init(string)'),
    };
    //greeter cid
    const cid = 'bafkreiezq4fqsc6z2v2chluobw76fkm7zkmdi5pdjvskseo2mducns633m';

    greeterPkg = await createPkg(clientAddress, pkg, cid, provider, signer[1]);
  });

  /* event Upgrade (address indexed pkg, address indexed client, bool install); */
  it('should view packages from events', async function () {
    const events = await connectorfacet.queryFilter('PackageCreated');
    pkgs = events.map((e) => e.args?.pkg);

    // get metadataOf(pkg)
    const metadata = await dappletsfacet.metadataOf(pkgs);
    console.log('📦 metadata', metadata);
  });

  it('should stake on a package', async function () {
    const assetAmount = ethers.utils.parseEther('0.1');

    const before = await dappletsfacet.balanceOf(visitorlogPkg);

    const tx = await dappletsfacet.connect(signer[1]).stake(visitorlogPkg, {
      value: assetAmount,
      gasLimit: 1000000,
    });
    const receipt = await tx.wait();
    const evts = receipt.events.filter((e: any) => e.event == 'Stake');
    expect(evts[0].args.account).to.equal(signer[1].address);
    expect(evts[0].args.pkg).to.equal(visitorlogPkg);

    // check balance
    const after = await dappletsfacet.balanceOf(visitorlogPkg);
    expect(after.sub(before)).to.equal(assetAmount);
  });

  it('should install a basic package to a diamond', async function () {
    const before = await clientloupefacet.facetAddresses();

    // send install(counterPkg, bytes(0))

    const visitorLogInstall = await installer
      .connect(signer[1])
      .install(visitorlogPkg, '0x', {
        gasLimit: 1000000,
        value: costOf.install,
      });
    await visitorLogInstall.wait();

    const after = await clientloupefacet.facetAddresses();

    expect(before.length).to.be.lessThan(after.length);
  });

  it('should allow user to send custom params, and owner to set cost to install', async function () {
    const before = await provider.getBalance(deployer.address);

    // pass functioncall as bytes -- init(string memory), where string is 'Hello, world!'
    const calldata = greeterinit.interface.encodeFunctionData('init(string)', [
      'Hello, world!',
    ]);

    const greeterInstall = await installer
      .connect(signer[1])
      .install(greeterPkg, calldata, {
        gasLimit: 1000000,
        value: costOf.install.add(ethers.utils.parseEther('0.0001')),
      });
    await greeterInstall.wait();

    const after = await provider.getBalance(deployer.address);

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
    const pkg = new Contract(visitorlogPkg, PKGInterface, provider);
    console.log('📦 pkg', pkg.address);

    const before = await provider.getBalance(signer[1].address);
    console.log('👤 before user balance', before.toString());

    const beforePkgBalanceOf = await pkg.balanceOf(signer[1].address);
    console.log('📦 beforePkgBalanceOf', beforePkgBalanceOf.toString());

    const amount = await pkg.maxRedeem(signer[1].address);
    console.log('📦 redeemable', amount.toString());

    const preview = await pkg.previewRedeem(amount);
    console.log('📦 preview redeem', preview.toString());

    const tx = await dappletsfacet
      .connect(signer[1])
      .unstake(visitorlogPkg, amount);
    const receipt = await tx.wait();
    const gas = receipt.gasUsed.mul(tx.gasPrice);
    const evts = receipt.events.filter((e: any) => e.event == 'Unstake');
    expect(evts[0].args.account).to.equal(signer[1].address);

    const after = await provider.getBalance(signer[1].address);
    console.log('👤 after user balance', after.toString());

    const afterPkgBalanceOf = await pkg.balanceOf(signer[1].address);
    console.log('📦 afterPkgBalanceOf', afterPkgBalanceOf.toString());

    // expect(after.sub(before)).to.equal(preview.sub(gas));

    // expect(beforePkgBalanceOf.sub(afterPkgBalanceOf)).to.equal(amount);
  });

  it('should create counter pkg', async function () {
    const Counter = await hre.ethers.getContractFactory('Counter');
    const counter = await Counter.deploy();
    await counter.deployed();
    console.log('Counter deployed to:', counter.address);
    await run('verify:sourcify', {
      name: 'Counter',
      address: counter.address,
      chainid: chainId,
    });

    const pkg: IPKGUpgrade = {
      cuts: createAddFacetCut([counter]),
      target: ethers.constants.AddressZero,
      selector: '0x00000000',
    };

    //counter cid
    const cid = 'bafkreidvmavlaya2j4jb7uddskc76vwy6a5atb47siaquwdp5kxb62ktai';

    counterPkg = await createPkg(clientAddress, pkg, cid, provider, signer[1]);

    const upgrade = new Contract(counterPkg, PKGInterface, provider);
    console.log('📦 pkg', upgrade.address);

    const get = await upgrade.get(0);
    const firstFacetAddr = get.cuts[0].target;
    expect(firstFacetAddr).to.equal(counter.address);
  });

  it('should create favoriter pkg', async function () {
    const Favoriter = await hre.ethers.getContractFactory('Favoriter');
    const favoriter = await Favoriter.deploy();
    await favoriter.deployed();
    console.log('Favoriter deployed to:', favoriter.address);
    await run('verify:sourcify', {
      name: 'Favoriter',
      address: favoriter.address,
      chainid: chainId,
    });

    const pkg: IPKGUpgrade = {
      cuts: createAddFacetCut([favoriter]),
      target: ethers.constants.AddressZero,
      selector: '0x00000000',
    };

    //favoriter cid
    const cid = 'bafkreiganjv6vhpentvya5q4i64uv25dlpf4atslp6zykd6rgsnttvwuoy';

    favoriterPkg = await createPkg(
      clientAddress,
      pkg,
      cid,
      provider,
      signer[1]
    );
  });
});
