import { useMemo } from 'react';
import { useSigner } from '.';
import { deployFacet } from '../actions/deployContract';
import { useDappletStore } from '../stores/dapplet';
import { LocalFacet } from '../types';

export function useDeployFacet(name: string, facet: LocalFacet) {
  const store = useDappletStore();

  const signer = useSigner();

  async function deploy() {
    if (!signer) {
      throw new Error('No signer found');
    }
    const facetCut = await deployFacet(facet, signer);
    console.log('facetCut', facetCut);
    facetCut && store.addFacetCut(name, facetCut);
  }

  return useMemo(() => {
    return deploy;
  }, [signer]);
}
