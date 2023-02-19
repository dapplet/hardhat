import { config } from 'dotenv';
import hre, { ethers } from 'hardhat';
import { costOf, createAddFacetCut, recompile } from './utils';
import { verify } from './utils/verify';
config();

async function deploy() {
  await recompile(hre);

  const [deployer] = await ethers.getSigners();
  const chainId = await ethers.provider
    .getNetwork()
    .then((network) => network.chainId);

  interface IContract {
    name: string;
    address: string;
  }
  let name;
  let contracts: IContract[] = [];

  /// Deploy Utils
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

  name = 'AdminFacet';
  const Admin = await ethers.getContractFactory(name);
  const admin = await Admin.deploy();
  await admin.deployed();
  contracts.push({ name, address: admin.address } as IContract);
  console.log('👮 AdminFacet deployed:', admin.address);

  name = 'ClientRegistry';
  const ClientRegistry = await ethers.getContractFactory(name);
  const clientregistry = await ClientRegistry.deploy();
  await clientregistry.deployed();
  contracts.push({ name, address: clientregistry.address } as IContract);
  console.log('🏭 ClientRegistry deployed:', clientregistry.address);

  name = 'ConnectorFacet';
  const Connector = await ethers.getContractFactory(name);
  const connector = await Connector.deploy();
  await connector.deployed();
  contracts.push({ name, address: connector.address } as IContract);
  console.log('🔌 ConnectorFacet deployed:', connector.address);

  name = 'DiamondCutFacet';
  const DiamondCutFacet = await ethers.getContractFactory(name);
  const diamondcutfacet = await DiamondCutFacet.deploy();
  await diamondcutfacet.deployed();
  contracts.push({ name, address: diamondcutfacet.address } as IContract);
  console.log('🔪 DiamondCutFacet deployed:', diamondcutfacet.address);

  name = 'StakingFacet';
  const Staking = await ethers.getContractFactory(name);
  const staking = await Staking.deploy();
  await staking.deployed();
  contracts.push({ name, address: staking.address } as IContract);
  console.log('🪙  StakingFacet deployed:', staking.address);

  name = 'ViewerFacet';
  const Viewer = await ethers.getContractFactory(name);
  const viewer = await Viewer.deploy();
  await viewer.deployed();
  contracts.push({ name, address: viewer.address } as IContract);
  console.log('👁️ ViewerFacet deployed:', viewer.address);

  const sysCuts = createAddFacetCut([
    loupe,
    ownership,
    erc165,
    admin,
    clientregistry,
    connector,
    diamondcutfacet,
    staking,
    // add viewer in 2nd cut
  ]);

  /// Deploy Initializers
  console.log('~~~ Deploying Initializers ~~~');
  name = 'SystemInit';
  const SystemInit = await ethers.getContractFactory(name);
  const systeminit = await SystemInit.deploy();
  await systeminit.deployed();
  contracts.push({ name, address: systeminit.address } as IContract);
  console.log('💠 SystemInit deployed:', systeminit.address);

  name = 'ClientInit';
  const ClientInit = await ethers.getContractFactory(name);
  const clientinit = await ClientInit.deploy();
  await clientinit.deployed();
  contracts.push({ name, address: clientinit.address } as IContract);
  console.log('💠 ClientInit deployed:', clientinit.address);

  name = 'SysUpgradeInit';
  const SysUpgradeInit = await ethers.getContractFactory(name);
  const sysupgradeinit = await SysUpgradeInit.deploy();
  await sysupgradeinit.deployed();
  contracts.push({ name, address: sysupgradeinit.address } as IContract);
  console.log('💠 SysUpgradeInit deployed:', sysupgradeinit.address);

  /// Deploy Diamond //////////////////////////////////////////
  const systemFees = [
    {
      selector: connector.interface.getSighash(
        'createPkg(((address,uint8,bytes4[])[],address,bytes4),string)'
      ),
      amount: costOf.createPkg,
    },
    {
      selector: clientregistry.interface.getSighash('createClient(string)'),
      amount: costOf.createClient,
    },
  ];

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

  name = 'Installer';
  const Installer = await ethers.getContractFactory(name);
  const installer = await Installer.deploy(diamond.address);
  await installer.deployed();
  contracts.push({ name, address: installer.address } as IContract);
  console.log('🔌 Installer deployed:', installer.address);

<<<<<<< HEAD
  const clientFacets = createAddFacetCut([loupe, ownership, erc165, installer]);
=======
  const clientFacets = createAddFacetCut([
    diamondloupe,
    ownership,
    erc165,
    installer,
  ]);
>>>>>>> 0ae3de27f6538bbf38454f3b293ac7924705871e

  const clientCut = {
    cuts: clientFacets,
    target: clientinit.address,
<<<<<<< HEAD
    selector: clientinit.interface.getSighash('init'),
  };

  const sysUpgradeCuts = createAddFacetCut([viewer]);
=======
    //@ts-ignore
    selector: clientinit.interface.getSighash('init'),
  };

  const rootOwner = await ens.owner(rootNode);
  if (rootOwner === deployer.address) {
    //@ts-ignore
    let tx = await ens.setOwner(rootNode, diamond.address);
    await tx.wait();
    const newOwner = await ens.owner(rootNode);
    if (newOwner === diamond.address) {
      console.log('👑 Root node owner set to Diamond:', diamond.address);
    } else {
      console.error('🚫 Root node owner not set to Diamond:', diamond.address);
    }
  } else {
    console.error('🚫 Root node already set, change it manually.');
  }

  name = 'ClientRegistry';
  const ClientRegistry = await ethers.getContractFactory(name);
  const clientregistry = await ClientRegistry.deploy(ens.address, rootNode);
  await clientregistry.deployed();
  contracts.push({ name, address: clientregistry.address } as IContract);
  console.log('🏭 ClientRegistry deployed:', clientregistry.address);

  const sysUpgradeCuts = createAddFacetCut([clientregistry]);
>>>>>>> 0ae3de27f6538bbf38454f3b293ac7924705871e

  const x_diamondcutfacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamond.address
  );
<<<<<<< HEAD
  const tx = await x_diamondcutfacet.diamondCut(
=======
  await x_diamondcutfacet.diamondCut(
>>>>>>> 0ae3de27f6538bbf38454f3b293ac7924705871e
    sysUpgradeCuts,
    sysupgradeinit.address,
    sysupgradeinit.interface.encodeFunctionData('init', [clientCut]),
    { gasLimit: 1000000 }
  );
  await tx.wait();

  console.log('~~~ Deployments complete ~~~');
  console.log('✅ Contracts deployed');

  await verify(contracts, chainId, true);
  console.log('✅ Contracts verified');
}

async function main() {
<<<<<<< HEAD
  await deploy();
=======
  const contracts = await deploy();
  console.log('✅ Contracts deployed');

  await verify(contracts);
  console.log('✅ Contracts verified');

  await saveDeployments(contracts, [
    './deployments.json',
    // '../interface/src/contracts/deployments.json',
    // '../shell/src/contracts/deployments.json',
    // '../template/imported/deployments.json',
  ]);
  console.log('✅ Deployments saved');
>>>>>>> 0ae3de27f6538bbf38454f3b293ac7924705871e
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
