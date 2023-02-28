import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { decode } from 'cbor-x';
import CID from 'cids';
import { existsSync, promises } from 'fs';
import type { IPFSHTTPClient } from 'ipfs-http-client';
import * as IPFS from 'ipfs-http-client';
import all from 'it-all';
import SourcifyJS from 'sourcify-js';
import uint8arrays from 'uint8arrays';
// import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
// import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
// import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

async function getBuildInfo() {
  const path = 'artifacts/build-info';
  const dir = await promises.readdir(path);
  const file = await promises.readFile(`${path}/${dir[0]}`);
  return JSON.parse(file.toString());
}

export async function createIPFS() {
  const ipfs = IPFS.create({
    url: process.env.INFURA_IPFS_API_ENDPOINT,
    headers: {
      authorization:
        'Basic ' +
        Buffer.from(
          process.env.INFURA_IPFS_PROJECT_ID +
            ':' +
            process.env.INFURA_IPFS_API_KEY_SECRET
        ).toString('base64'),
    },
  });
  return ipfs as IPFSHTTPClient;
}

export async function getABIfromBuildInfo(name: string) {
  const buildInfo = await getBuildInfo();
  let contract: any;
  for (contract of Object.values(buildInfo.output.contracts)) {
    if (Object.keys(contract).includes(name)) {
      return contract[name].abi;
    }
  }
  return null;
}

async function saveDeployment(
  contract: { name: string; address: string },
  paths: string[],
  chainId: number,
  abi?: any
) {
  let deployment: {
    address: string;
    cid?: string | null;
    abi?: any;
  } = {
    address: contract.address,
  };
  abi && (deployment.abi = abi);

  for (const path of paths) {
    if (!existsSync(path)) {
      await promises.writeFile(path, '{}');
    }
    const buffer = await promises.readFile(path);
    const string = buffer.toString();
    const json = JSON.parse(string);
    // overwrite existing deployment at chainId, contract.name
    if (!json[chainId]) {
      json[chainId] = {};
    }
    if (!json[chainId][contract.name]) {
      json[chainId][contract.name] = {};
    }
    json[chainId][contract.name] = deployment;

    // json[chainId][contract.name] = deployment;
    await promises.writeFile(path, JSON.stringify(json, null, 2));
  }
  return true;
}

export async function verify(
  contracts: { name: string; address: string }[],
  chainId: number,
  savePaths?: string[] | null,
  saveABI?: boolean
) {
  const ipfs = await createIPFS();
  const buildInfo = await getBuildInfo();
  const sourcify = new SourcifyJS();
  for await (const compiledContract of Object.values(
    buildInfo.output.contracts
  )) {
    for await (const contract of contracts) {
      if (Object.keys(compiledContract as any).includes(contract.name)) {
        const buffer = Buffer.from(
          (compiledContract as any)[contract.name].metadata
        );
        if (chainId === 1 || chainId === 5) {
          await sourcify.verify(
            chainId,
            [
              {
                name: contract.name,
                address: contract.address,
              },
            ],
            buffer
          );
        }
        const cid = await ipfs.add(buffer);
        if (savePaths) {
          if (saveABI) {
            await saveDeployment(
              contract,
              savePaths,
              chainId,
              await getABIfromBuildInfo(contract.name)
            );
          } else {
            await saveDeployment(contract, savePaths, chainId);
          }
        }

        console.log(`ℹ️ Verified ${contract.name} at ${cid.path}`);
      }
    }
  }
}

export async function getMetadata(address: string, provider: any) {
  const ipfs = await createIPFS();

  const code = await provider.getCode(address);
  const ipfsHashLength = parseInt(`${code.substring(code.length - 4)}`, 16);
  const cborEncoded = code.substring(
    code.length - 4 - ipfsHashLength * 2,
    code.length - 4
  );
  const contractMetadata = decode(
    uint8arrays.fromString(cborEncoded, 'base16')
  );
  const cidv0 = new CID(bs58.encode(contractMetadata.ipfs));
  const cidv1 = new CID(1, 'dag-pb', cidv0.bytes, 'base32');
  const data = uint8arrays.concat(await all(ipfs.cat(String(cidv1))));
  const metadata = JSON.parse(uint8arrays.toString(data));
  return metadata;
}
