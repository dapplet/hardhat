import { useState } from 'react';
import { useSigner } from '.';
import { createPkg } from '../actions/createPkg';
import { useDappletStore } from '../stores/dapplet';

export function useCreatePkg() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  console.log('error', error);

  const store = useDappletStore();

  const signer = useSigner();

  function compileUpgrade() {
    const cuts = store?.upgrade?.facets.map((f: any, i) => {
      return (Object.values(f)[0] as any)?.cut;
    });
    const target = store?.upgrade?.initializer?.target;
    const selector = store?.upgrade?.initializer?.selector;
    return { cuts, target, selector };
  }

  async function send() {
    setLoading(true);
    try {
      if (!signer) throw new Error('No signer found');
      const upgrade = compileUpgrade();
      const client = store?.client?.address;
      const cid = store?.CID;
      const pkg = await createPkg(client, upgrade, cid, signer);
      console.log('pkg', pkg);
      pkg && store.addAddress(pkg);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return { send, error, loading };
}
