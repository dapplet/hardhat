import { task } from 'hardhat/config';
import * as types from 'hardhat/internal/core/params/argumentTypes';
import { verify } from '../scripts/utils/verify';

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
