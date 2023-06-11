import { useEthers } from '@usedapp/core';
import { Contract, ethers } from 'ethers';
import { useMemo, useState } from 'react';
import create from 'zustand';
import { deployment } from '../contracts';
import { DappletsFacet__factory, PKG__factory } from '../contracts/types';
import { isLiveAddress, storage_key } from '../hooks';
import { installedBy } from '../hooks/useInstallPkg';
import { IFacetCut } from '../types';

interface DappletState {
  name: string;
  client: any;
  chainId: any;
  CID: string;
  upgrade: any;
  load: () => Promise<void>;
  loading: boolean;
  error: string | null;
  reset: () => Promise<void>;
  addFacetCut: (name: string, cut: IFacetCut) => void;
  addInitializer: (initializer: any) => void;
  addAddress: (address: string) => void;
  setFacetIsDeployed: (name: string, isDeployed: boolean) => void;
  setInitializerIsDeployed: (isDeployed: boolean) => void;
  setCID: (CID: string) => void;
  checkInstalls: () => void;
  updateInstalls: (client: string, system: string) => void;
  // removeFacetByTarget: (target: string) => void;
  // removeSelector: (target: string, selector: string) => void;
}

export const useDappletStore = create<DappletState>((set) => ({
  name: '',
  client: { address: '', installs: [] },
  chainId: {},
  CID: '',
  upgrade: {
    address: '',
    facets: [],
    initalizer: {},
  },
  load: async () => {
    const val = localStorage.getItem('DAPPLET_CONFIG');
    const config = val && JSON.parse(val);
    console.log('asdf config', config);
    const name = config.name;
    const client = await getClientFromLocalStorage(config);
    const network = config.chainId;
    const cid = config.CID || '';
    const upgrade = await getUpgradeFromLocalStorage(config);
    set(() => ({ name, client, network, CID: cid, upgrade, loading: false }));
  },
  loading: true,
  error: null,
  // add
  reset: async () => {
    localStorage.setItem(storage_key, null);
    set(() => ({
      upgrade: {
        facets: [],
        initalizer: {},
      },
    }));
  },
  addFacetCut: async (name, cut) => {
    const isLive = await isLiveAddress(cut.target, getProvider());
    set((state) => {
      const facet = state.upgrade?.facets?.find((f: any) => {
        return Object.keys(f)[0] === name;
      });
      if (isLive) {
        //overwrite with new cut
        const newFacet = {
          [name]: {
            ...facet?.[name],
            cut,
          },
        };
        const newFacets = state.upgrade?.facets?.map((f: any) => {
          if (Object.keys(f)[0] === name) {
            return newFacet;
          }
          return f;
        });
        return {
          ...state,
          upgrade: {
            ...state.upgrade,
            facets: newFacets,
          },
        };
      }
    });
  },
  addInitializer: async (initializer) => {
    const isLive = await isLiveAddress(initializer.target, getProvider());
    set((state) => {
      if (isLive) {
        return {
          ...state,
          upgrade: {
            ...state.upgrade,
            initializer: {
              ...state.upgrade.initializer,
              target: initializer.target,
              selector: initializer.selector,
            },
          },
        };
      }
    });
  },
  addAddress: async (address) => {
    const isLive = await isLiveAddress(address, getProvider());
    set((state) => {
      if (isLive) {
        return {
          ...state,
          upgrade: {
            ...state.upgrade,
            address,
          },
        };
      }
    });
  },
  setFacetIsDeployed: async (name, isDeployed) => {
    set((state) => {
      const facet = state.upgrade?.facets?.find((f: any) => {
        return Object.keys(f)[0] === name;
      });
      if (facet) {
        return {
          ...state,
          upgrade: {
            ...state.upgrade,
            facets: state.upgrade?.facets?.map((f: any) => {
              if (Object.keys(f)[0] === name) {
                return {
                  [name]: {
                    ...facet?.[name],
                    isDeployed,
                  },
                };
              }
              return f;
            }),
          },
        };
      }
    });
  },
  setInitializerIsDeployed: async (isDeployed) => {
    set((state) => {
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          initializer: {
            ...state.upgrade.initializer,
            isDeployed,
          },
        },
      };
    });
  },
  setCID: async (CID) => {
    set((state) => {
      return {
        ...state,
        CID,
      };
    });
  },
  checkInstalls: async () => {
    const config = JSON.parse(process.env.DAPPLET_CONFIG);
    const client = await getClientFromLocalStorage(config);
    const installs = await Promise.all(
      client.installs.map(async (install) => {
        const isLive = await isLiveAddress(install.address, getProvider());
        return {
          ...install,
          isLive,
        };
      })
    );
    set((state) => {
      return {
        ...state,
        client: {
          ...state.client,
          installs,
        },
      };
    });
  },
  updateInstalls: async (client, system) => {
    const installs = await installedBy(client, system);
    set((state) => {
      return {
        ...state,
        client: {
          ...state.client,
          installs,
        },
      };
    });
  },

  // // remove
  // removeFacetByTarget: (target: string) => {
  //   set((state) => ({
  //     // cuts: state.cuts.filter((cut) => cut.target !== target),
  //   }));
  // },

  // removeSelector: (target: string, selector: string) => {
  //   set((state) => ({
  //     // cuts: state.cuts.map((cut) => {
  //     //   if (cut.target === target) {
  //     //     return {
  //     //       ...cut,
  //     //       selectors: cut.selectors.filter((s) => s !== selector),
  //     //     };
  //     //   }
  //     //   return cut;
  //     // }),
  //   }));
  // },
}));

// setup().then((upgrade) => useDappletStore.setState({ upgrade }));

//TODO: change getFromLocalStorage functions to NOT use ENV variables

async function getClientFromLocalStorage(config) {
  if (!config) {
    throw new Error('Dapplet config not found');
  }
  const { client } = config;
  if (!client) {
    throw new Error('Dapplet client not found. You must provide one!');
  }
  const provider = getProvider();
  const chainId = (await provider.getNetwork()).chainId;
  const system = deployment('Diamond', chainId);

  const DappletsFacet = new Contract(
    system.address,
    DappletsFacet__factory.abi,
    provider
  );
  const installs = await DappletsFacet.installedBy(client);
  return {
    ['address']: client,
    ['installs']: installs,
  };
}

async function getUpgradeFromLocalStorage(config) {
  if (!config) {
    throw new Error('Dapplet config not found');
  }
  const { facets, initializer } = config;
  const a = await getUpgradeAddressFromLocalStorage();
  const f = await Promise.all(
    Object.entries(facets).map(async ([name, obj]) => {
      const { abi, bytecode, functions } = obj as any;
      const cut = await getCutFromLocalStorage(name);
      return {
        [name]: {
          abi,
          bytecode,
          functions,
          cut,
        },
      };
    })
  );
  const i = Object.assign(await getInitializerFromLocalStorage(), initializer);
  return {
    ['address']: a,
    ['facets']: f,
    ['initializer']: i,
  } as any;
}

async function getUpgradeAddressFromLocalStorage() {
  let addr = '';
  try {
    const local = localStorage.getItem(storage_key);
    if (local) {
      const { upgrade } = JSON.parse(local);
      const isLive = await isLiveAddress(upgrade.address, getProvider());
      console.log('upgrade deployed:', isLive, upgrade.address);
      if (isLive) {
        addr = upgrade.address;
        // get pkg contents
        // check if pkg contents match upgrade.facets & initializer
      }
    }
  } catch (e) {
    console.error('error getting upgrade address from local storage', e);
  }
  return addr;
}

async function getCutFromLocalStorage(name: string) {
  const local = localStorage.getItem(storage_key);
  let cut = {} as IFacetCut;
  if (local) {
    const facet = JSON.parse(local)?.upgrade?.facets.find((f: any) => {
      return Object.keys(f)[0] === name;
    });
    const target = facet?.[name]?.cut?.target;
    const isLive = await isLiveAddress(target, getProvider());
    console.log('isLive', name, isLive, target);
    if (isLive) {
      cut = facet[name].cut;
    }
  }
  return cut;
}

async function getInitializerFromLocalStorage() {
  const local = localStorage.getItem(storage_key);
  let init = {
    target: ethers.constants.AddressZero,
    selector: '0x00000000',
  } as any;
  if (local) {
    const initializer = JSON.parse(local)?.upgrade?.initializer;
    const isLive = await isLiveAddress(initializer?.target, getProvider());
    if (isLive) {
      init = {
        target: initializer.target,
        selector: initializer.selector,
      };
    }
  }
  return init;
}

export function getProvider() {
  if ((window as any).ethereum) {
    return new ethers.providers.Web3Provider((window as any).ethereum);
    // use the provider object to interact with the blockchain
  } else {
    console.log('Please install MetaMask!');
  }
}

export function useFacetDeployed(name: string) {
  const store = useDappletStore();
  const { library } = useEthers();

  const facet =
    store?.upgrade &&
    store?.upgrade.facets.find((f: any) => {
      return Object.keys(f)[0] === name;
    })?.[name];
  const target = facet?.cut?.target;
  useMemo(() => {
    async function checkAddress() {
      const isLive = await isLiveAddress(target, getProvider());
      isLive
        ? store.setFacetIsDeployed(name, true)
        : store.setFacetIsDeployed(name, false);
    }
    checkAddress();
  }, [target, library]);

  console.log(name, 'deployed', facet?.isDeployed, target);

  return facet?.isDeployed;
}

export function useInitializerDeployed() {
  const store = useDappletStore();

  const initializer = store?.upgrade?.initializer;
  const target = initializer?.target;
  useMemo(() => {
    async function checkAddress() {
      const isLive = await isLiveAddress(target, getProvider());
      isLive
        ? store.setInitializerIsDeployed(true)
        : store.setInitializerIsDeployed(false);
    }
    checkAddress();
  }, [target]);

  console.log('initializer deployed', initializer?.isDeployed, target);

  return initializer?.isDeployed;
}

export function useUpgradeAddressDeployed() {
  const { upgrade } = useDappletStore();
  const address = upgrade?.address;

  const [deployed, setDeployed] = useState(false);

  useMemo(() => {
    async function checkAddress() {
      const isLive = await isLiveAddress(address, getProvider());
      if (isLive) {
        const PKG = new ethers.Contract(
          address,
          PKG__factory.abi,
          getProvider()
        );
        const get = await PKG.get(0);
        //match get with store.upgrade facets & initializers
        let eq = true;
        for (const cut of get.cuts) {
          const isLive = await isLiveAddress(cut.target, getProvider());
          if (isLive) {
            // cut should match the cut in store.upgrade.facets.map(facet => facet[facetName].cut)
            eq =
              eq &&
              upgrade?.facets.find((f: any) => {
                const obj = Object.values(f)[0] as any;
                return obj?.cut?.target === cut.target;
              });
          }
        }
        const isLive = await isLiveAddress(get.target, getProvider());
        if (isLive) {
          eq =
            eq &&
            upgrade?.initializer?.target === get.target &&
            upgrade?.initializer?.selector === get.selector;
        }
        setDeployed(eq);
      }
    }
    checkAddress();
  }, [address, upgrade?.facets, upgrade?.initializer]);

  return deployed;
}

export function useGetPkg(addr) {
  const PKG = new Contract(addr, PKG__factory.abi, getProvider());
  const [pkg, setPkg] = useState(null);

  useMemo(() => {
    PKG.get(0).then((pkg) => {
      setPkg(pkg);
    });
  }, [addr]);

  return pkg;
}
