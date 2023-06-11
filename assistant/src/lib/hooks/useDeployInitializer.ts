import { useEthers } from '@usedapp/core';
import { useMemo } from 'react';
import { useSigner } from '.';
import { deployInitializer } from '../actions/deployContract';
import { useDappletStore } from '../stores/dapplet';
import { LocalInitializer } from '../types';

export function useDeployInitializer(initializer: LocalInitializer) {
  const { library } = useEthers();
  const signer = useSigner();

  const store = useDappletStore();

  async function deploy() {
    if (!signer) {
      throw new Error('No signer found');
    }
    const init = await deployInitializer(initializer, signer);
    init && store.addInitializer(init);
  }

  return useMemo(() => {
    return deploy;
  }, [library]);
}
