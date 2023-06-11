import { getAddress } from 'ethers/lib/utils';
import { gateways } from '../constants';

export async function fetchFirstAvailable(cid: string, file?: string) {
  for (const schema of gateways) {
    let url;
    if (file) {
      url = `${schema.prefix}${cid}${schema.suffix}/${file}`;
    } else {
      url = `${schema.prefix}${cid}${schema.suffix}`;
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        const res = await response.json();
        return { res, schema };
      }
    } catch {
      console.error(`Fetch stopped: ${url}`);
    }
  }
  return { res: null, schema: null };
}
export function parseInstalls(logs: any[], schema: 'args' | 'data') {
  return logs
    .filter((upgrade) => upgrade[schema]?.install === true)
    .filter((upgrade) => {
      const uninstalls = logs.filter(
        (upgrade) => upgrade[schema]?.install === false
      );
      return uninstalls.every((uninstall) => {
        return uninstall.blockNumber < upgrade.blockNumber;
      });
    })
    .map((upgrade) => upgrade[schema]?.pkg);
}

export function getDiamond() {
  const subdomain = window.location.hostname.split('.')[0];
  if (subdomain === 'localhost' || subdomain === '127') {
    return '0x0000000000000000000000000000000000000000';
  } else {
    return getAddress(subdomain);
  }
}

export function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

//deploy new system (for localhost only)

// import contracts as a node package @dapplet/contracts

// insert into getPilets()
// if !(NODE_ENV === 'production') && any address under deployments[31337] is invalid, run deploySystem()
