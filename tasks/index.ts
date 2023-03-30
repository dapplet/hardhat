import { task } from 'hardhat/config';
import * as types from 'hardhat/internal/core/params/argumentTypes';
import { createClient } from '../scripts/utils/createClient';
import { createPkg } from '../scripts/utils/createPkg';
import { verify } from '../scripts/utils/verify';
import { IPKGUpgrade } from '../types';

task(
  'verify:sourcify',
  'Verifies contract on sourcify and sends metadata to IPFS'
)
  .addParam(
    'name',
    'The name of the contract to verify',
    undefined,
    types.string
  )
  .addParam(
    'address',
    'The address of the contract to verify',
    undefined,
    types.string
  )
  .addParam(
    'chainid',
    'The chainId of the contract to verify',
    undefined,
    types.int
  )
  .addOptionalParam(
    'savepath',
    'The path to save the deployment to',
    undefined,
    types.string
  )
  .setAction(async (args) => {
    console.log('Verifying contract on sourcify and sending metadata to IPFS');
    await verify(
      [
        {
          name: args.name,
          address: args.address,
        },
      ],
      args.chainid
    );
  });

task('create:client', 'Creates a client and adds it to the ClientRegistry')
  .addParam('name', 'The name of the client to create', undefined, types.string)
  .setAction(async (args, hre) => {
    await createClient(args.name, hre.ethers.provider);
  });

task(
  'create:client-with-pkg',
  'Creates a package and adds it to the PackageRegistry'
)
  .addParam('name', 'The name of the client to create', undefined, types.string)
  .addOptionalParam(
    'signer',
    'The address of the signer',
    undefined,
    types.string
  )
  .addOptionalParam(
    'cid',
    'The cid of the package to create',
    undefined,
    types.string
  )
  .setAction(async (args, hre) => {
    // const signer: SignerWithAddress = args.signer
    //   ? await hre.ethers.getSigner(args.signer)
    //   : ((await hre.ethers.getSigners())?.[0] as SignerWithAddress);

    const clientAddress = await createClient(args.name, hre.ethers.provider);

    // get cwd
    const cwd = process.cwd();
    const packageJson = require(`${cwd}/package.json`);
    const { custom } = packageJson;
    const pkg: IPKGUpgrade = custom;

    const cid =
      args.cid || 'bafkreibqxnhdkj4eihg4klptqsaw6ckdnhqtlv4lylwcopgylmqf5npiyq';

    const pkgAddress = await createPkg(
      clientAddress,
      pkg,
      cid,
      hre.ethers.provider
    );

    console.log('📦', pkgAddress);
  });
