import { useEthers } from '@usedapp/core';
import { ethers } from 'ethers';
import { Fragment, Interface, isAddress } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { deployment } from '../contracts';

export const storage_key = 'local_dapplet_store';

export async function getInterface(abi: string) {
  return new Interface(abi);
}

export function useInterface(abi?: string) {
  const [iface, setIface] = useState<Interface>();

  useMemo(async () => {
    if (abi) {
      setIface(await getInterface(abi));
    }
  }, [abi]);

  return iface;
}

export function useMatchSelectors(iface: Interface, selectors: string[]) {
  const [fragments, setFragments] = useState<any[]>([]);

  useMemo(() => {
    if (iface && selectors) {
      const f = selectors.map((selector) => iface.getFunction(selector));
      setFragments(f);
    }
  }, [iface, selectors]);

  return fragments;
}

export function useMatchABIFunctionsWithSelectors(
  abi: string,
  selectors: any[]
) {
  const iface = useInterface(abi);
  const fragments = useMatchSelectors(iface as Interface, selectors);
  return { fragments, iface };
}

export function useSelectors(iface: Interface) {
  const [selectors, setSelectors] = useState<string[]>([]);
  const [fragments, setFragments] = useState<Fragment[]>();

  useMemo(() => {
    if (iface) {
      const functions = iface.fragments.filter(
        (fragment) => fragment.type === 'function'
      );
      setSelectors(functions.map((fragment) => iface.getSighash(fragment)));
      setFragments(functions);
    }
  }, [iface]);

  return { selectors, fragments };
}

export function matchFunctionsWithSelectors(
  humanReadableFunctions: string[],
  iface: Interface,
  selectors: string[]
) {
  const functions =
    humanReadableFunctions[0] === '*'
      ? iface.fragments
          .filter((fragment) => fragment.type === 'function')
          .map((fragment) => iface.getSighash(fragment))
      : humanReadableFunctions.map((functionName) =>
          iface.getSighash(functionName)
        );
  return { selectors, functions };
}

export function useMatchFunctionsWithABI(
  abi: string,
  humanReadableFunctions: string[]
) {
  const iface = useInterface(abi);
  const { selectors } = useSelectors(iface as Interface);
  const [functions, setFunctions] = useState<string[]>([]);

  useMemo(() => {
    if (iface && selectors && humanReadableFunctions) {
      const fns = matchFunctionsWithSelectors(
        humanReadableFunctions,
        iface,
        selectors
      ).functions;
      setFunctions(fns);
    }
  }, [iface, selectors, humanReadableFunctions]);

  return { selectors, functions };
}

// OK: was this the source of the problem? -- using library uses localhost, not the forked chain????
export async function isLiveAddress(
  address: string,
  library: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider
) {
  if (typeof address === 'string' && isAddress(address)) {
    const code = await library.getCode(address);
    return code !== '0x';
  } else {
    return false;
  }
}

export function useIsLiveAddress(address: string | undefined) {
  const { library } = useEthers();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (library && address) {
      isLiveAddress(address, library).then((isLive) => {
        if (isLive) {
          setLive(true);
        }
      });
    }
  }, [library, address]);

  return live;
}

export function useSigner() {
  const { account, library } = useEthers();
  const signer = useMemo(() => {
    if (library && 'getSigner' in library) {
      return library.getSigner(account);
    }
  }, [account, library]);
  return signer;
}

export function useSystem() {
  const { chainId } = useEthers();
  const obj = deployment('Diamond', chainId);
  return obj;
}
