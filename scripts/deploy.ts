import { config } from 'dotenv';
import hre, { ethers } from 'hardhat';
import { IContract } from '../types';
import { costOf, createAddFacetCut, recompile } from './utils';
import { saveContracts, verify } from './utils/verify';
config();

let chainId: number;

export async function deploy() {
  const [deployer] = await ethers.getSigners();
  chainId = await ethers.provider
    .getNetwork()
    .then((network) => network.chainId);

  let name;
  let contracts: IContract[] = [];

  // /// Deploy Utils
  console.log('~~~ Deploying Utils ~~~');
  name = 'Multicall2';
  const Multicall2 = await ethers.getContractFactory(name);
  const multicall2 = await Multicall2.deploy();
  await multicall2.deployed();
  contracts.push({ name, address: multicall2.address } as IContract);
  console.log('📡 Multicall2 deployed:', multicall2.address);

  /// Deploy Shared Facets
  console.log('~~~ Deploying shared facets ~~~');
  name = 'DiamondLoupeFacet';
  const Loupe = await ethers.getContractFactory('DiamondLoupeFacet');
  const loupe = await Loupe.deploy();
  await loupe.deployed();
  contracts.push({ name, address: loupe.address } as IContract);
  console.log('🔮 DiamondLoupeFacet deployed:', loupe.address);

  name = 'OwnershipFacet';
  const Ownership = await ethers.getContractFactory(name);
  const ownership = await Ownership.deploy();
  await ownership.deployed();
  contracts.push({ name, address: ownership.address } as IContract);
  console.log('💍 OwnershipFacet deployed:', ownership.address);

  name = 'ERC165Facet';
  const ERC165 = await ethers.getContractFactory(name);
  const erc165 = await ERC165.deploy();
  await erc165.deployed();
  contracts.push({ name, address: erc165.address } as IContract);
  console.log('🗺  ERC165Facet deployed:', erc165.address);

  /// Deploy Shell Facets
  console.log('~~~ Deploying Shell Facets ~~~');

  name = 'OperatorFacet';
  const OperatorFacet = await ethers.getContractFactory(name);
  const operatorfacet = await OperatorFacet.deploy();
  await operatorfacet.deployed();
  contracts.push({ name, address: operatorfacet.address } as IContract);
  console.log('🔌 OperatorFacet deployed:', operatorfacet.address);

  name = 'DappletsFacet';
  const DappletsFacet = await ethers.getContractFactory(name);
  const dappletsfacet = await DappletsFacet.deploy();
  await dappletsfacet.deployed();
  contracts.push({ name, address: dappletsfacet.address } as IContract);
  console.log('📦 DappletsFacet deployed:', dappletsfacet.address);

  name = 'DappsFacet';
  const DappsFacet = await ethers.getContractFactory(name);
  const dappsfacet = await DappsFacet.deploy();
  await dappsfacet.deployed();
  contracts.push({ name, address: dappsfacet.address } as IContract);
  console.log('📱 DappsFacet deployed:', dappsfacet.address);

  name = 'DiamondCutFacet';
  const DiamondCutFacet = await ethers.getContractFactory(name);
  const diamondcutfacet = await DiamondCutFacet.deploy();
  await diamondcutfacet.deployed();
  contracts.push({ name, address: diamondcutfacet.address } as IContract);
  console.log('🔪 DiamondCutFacet deployed:', diamondcutfacet.address);

  const sysCuts = createAddFacetCut([
    loupe,
    ownership,
    erc165,
    operatorfacet,
    dappletsfacet,
    dappsfacet,
    diamondcutfacet,
  ]);

  /// Deploy Initializers
  console.log('~~~ Deploying Initializers ~~~');
  name = 'SystemInit';
  const SystemInit = await ethers.getContractFactory(name);
  const systeminit = await SystemInit.deploy();
  await systeminit.deployed();
  contracts.push({ name, address: systeminit.address } as IContract);
  console.log('💠 SystemInit deployed:', systeminit.address);

  /// 🚫🚫🚫🚫

  /// Deploy Diamond //////////////////////////////////////////
  const systemFees = [
    {
      selector: operatorfacet.interface.getSighash(
        'createPkg(((address,uint8,bytes4[])[],address,bytes4),string,address)'
      ),
      amount: costOf.createPkg,
    },
    {
      selector: dappsfacet.interface.getSighash('createClient(bytes32)'),
      amount: costOf.createClient,
    },
  ];
  /* address _creator, FacetCut[] memory _cuts, address _target, bytes memory _data */

  name = 'Diamond';
  const Diamond = await ethers.getContractFactory(name);
  const diamond = await Diamond.deploy(
    deployer.address,
    sysCuts,
    systeminit.address,
    systeminit.interface.encodeFunctionData('init', [
      systemFees,
      costOf.install,
    ])
  );
  await diamond.deployed();
  contracts.push({ name, address: diamond.address } as IContract);
  console.log('💎 Diamond deployed:', diamond.address);

  //TODO: update contracts
  name = 'BasicDiamond';
  const Basic = await ethers.getContractFactory(name);
  const basic = await Basic.deploy(diamond.address);
  await basic.deployed();
  contracts.push({ name, address: basic.address } as IContract);
  console.log('📦 BasicDiamond deployed:', basic.address);

  // call init(owner) on BasicDiamond
  const init = await basic.connect(deployer).init(deployer.address);
  await init.wait();

  //get owner of BasicDiamond
  const owner = await basic.owner();
  console.log('👑 BasicDiamond owner:', owner);

  const basic_id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('basic'));

  // setBaseplate
  const x_dapps = await ethers.getContractAt('DappsFacet', diamond.address);
  const tx = await x_dapps
    .connect(deployer)
    .setBaseplate(basic_id, basic.address);
  await tx.wait();

  // // get installer address
  // const x_dapps = await ethers.getContractAt('DappsFacet', diamond.address);
  // const clientUpgradeData = await x_dapps.getClientUpgrade('default');
  // const installerAddress = clientUpgradeData.cuts[0].target;
  // contracts.push({
  //   name: 'Installer',
  //   address: installerAddress,
  // } as IContract);
  // console.log('💎 Installer deployed:', installerAddress);

  return contracts;
}

async function main() {
  await recompile(hre);
  const contracts = await deploy();
  console.log('✅ Contracts deployed');

  await verify(contracts, chainId);
  console.log('✅ Contracts verified');

  await saveContracts(contracts, chainId, [
    '../interface/src/contracts/deployments.json',
    '../shell/src/contracts/deployments.json',
    './assistant/src/lib/contracts/deployments.json',
  ]);

  await saveContracts(contracts, chainId, ['./deployments.json'], true, true);
  console.log('✅ Deployments saved');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
