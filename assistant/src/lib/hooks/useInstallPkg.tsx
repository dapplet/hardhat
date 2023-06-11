import { useBlockNumber, useCall, useEthers } from '@usedapp/core';
import { BigNumber, Contract, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { getInterface, useSigner, useSystem } from '.';
import { installPkg, uninstallPkg } from '../actions/installPkg';
import { costOf } from '../constants';
import { useInitializer } from '../contracts/hooks/Initializer';
import {
  DappletsFacet__factory,
  DiamondLoupeFacet__factory,
} from '../contracts/types';
import {
  getProvider,
  useDappletStore,
  useUpgradeAddressDeployed,
} from '../stores/dapplet';

export function useInstallPkg() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const store = useDappletStore();

  const signer = useSigner();

  const system = useSystem();

  //get cost
  const { value: cost } =
    useInitializer.cost(store?.upgrade?.initializer?.target, []) || {};

  const installCost = useMemo(() => {
    return cost?.[0]?.add(costOf.install) || costOf.install;
  }, [cost]);

  const initializer = Object.values(
    store?.upgrade?.initializer || {}
  )[0] as any;

  async function send() {
    setLoading(true);
    try {
      const client = store?.client?.address;
      const iface =
        initializer !== ethers.constants.AddressZero &&
        (await getInterface(initializer?.abi));
      const fn = iface && iface.getFunction(initializer?.function);
      const args = fn && initializer.defaultArgs;
      const calldata =
        initializer && iface && fn ? iface.encodeFunctionData(fn, args) : '0x';
      const addr = store?.upgrade?.address;
      const installed =
        addr && calldata && (await installPkg(client, addr, signer, calldata));

      console.log('asdf installed', installed);

      installed && store.checkInstalls();
      //update installs
      store.updateInstalls(client, system);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return { send, error, loading };
}

export function useUninstallPkg() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const store = useDappletStore();
  const client = store?.client?.address;
  const system = useSystem();

  const signer = useSigner();

  async function send(pkg: string) {
    setLoading(true);
    try {
      const client = store?.client?.address;
      const uninstalled =
        client && (await uninstallPkg(client, pkg, signer, '0x'));

      uninstalled && store.checkInstalls();

      console.log('asdf uninstalled', uninstalled);

      // update installs
      store.updateInstalls(client, system.address);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return { send, error, loading };
}

export async function installedBy(client: string, system: string) {
  const provider = getProvider();
  const DappletsFacet = new Contract(
    system,
    DappletsFacet__factory.abi,
    provider
  );
  return await DappletsFacet.installedBy(client);
}

export function useInstalledBy() {
  const [installs, setInstalls] = useState<any[]>([]);

  const store = useDappletStore();
  const storedInstalls = store?.client?.installs;
  const client = store?.client?.address;
  const system = useSystem();

  const block = useBlockNumber();

  const { chainId } = useEthers();

  useEffect(() => {
    async function check() {
      const installedByClient = await installedBy(client, system.address);
      setInstalls(installedByClient);
    }

    client && check();
  }, [block, storedInstalls, client, chainId]);

  return installs;
}

export async function isInstalled(
  upgrade: any,
  client: string,
  installedByClient: string[]
) {
  const provider = getProvider();
  const Loupe = new Contract(client, DiamondLoupeFacet__factory.abi, provider);
  const facets = await Loupe.facets();
  //check if facet selectors are already added
  const selectors = facets
    .map((f: any) => {
      return f.selectors.map((s: any) => s.toString());
    })
    .flat();
  let conflicts = false;
  upgrade?.facets.map((f: any) => {
    const facet = Object.values(f)[0] as any;
    const sels = facet?.cut?.selectors;
    for (const sel of sels) {
      if (selectors.includes(sel)) {
        conflicts = true;
        break;
      }
    }
  });

  if (conflicts) {
    return installedByClient.includes(upgrade?.address);
  }
  return false;
}

export function useIsInstalled() {
  const [installed, setInstalled] = useState(false);

  const installs = useInstalledBy();

  const store = useDappletStore();
  const client = store?.client?.address;
  const storedInstalls = store?.client?.installs;
  const upgrade = store?.upgrade;

  const created = useUpgradeAddressDeployed();

  const { chainId } = useEthers();

  useMemo(() => {
    async function check() {
      const installed = await isInstalled(upgrade, client, installs);
      setInstalled(installed);
    }

    created && check();
  }, [storedInstalls, client, chainId, created, upgrade, installs]);

  return installed;
}

//TODO: trigger this on install/uninstall
export function usePkgInstalled() {
  const [installed, setInstalled] = useState(false);
  const [installs, setInstalls] = useState<any[]>([]);

  const store = useDappletStore();
  const client = store?.client?.address;
  const storedInstalls = store?.client?.installs;
  const upgrade = store?.upgrade;

  const created = useUpgradeAddressDeployed();

  const system = useSystem();

  const { chainId } = useEthers();

  useMemo(() => {
    async function check() {
      const installedByClient = await installedBy(client, system.address);
      setInstalls(installedByClient);

      const installed = await isInstalled(upgrade, client, installedByClient);
      setInstalled(installed);
    }

    created && check();
  }, [storedInstalls, client, chainId, created, upgrade]);

  return { installed, installs };
}

export function useInitializerCost(
  addr: string | undefined,
  iface: Interface | undefined
): BigNumber | undefined {
  const { value, error } =
    useCall(
      addr &&
        iface && {
          contract: new Contract(addr, iface),
          method: 'cost',
          args: [],
        }
    ) ?? {};
  if (error) {
    console.error(error.message);
    return undefined;
  }
  return value?.[0];
}
