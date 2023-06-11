import { SlButton, SlCard } from '@shoelace-style/shoelace/dist/react';
import * as React from 'react';
import { useDeployInitializer } from '../../lib/hooks/useDeployInitializer';
import {
  useDappletStore,
  useInitializerDeployed,
} from '../../lib/stores/dapplet';

function InitializerCard() {
  const store = useDappletStore();
  const initializer = store?.upgrade?.initializer;
  console.log('asdfs initializer', initializer);
  const name = Object.keys(initializer)[0];
  const values = initializer[name];

  const deploy = useDeployInitializer(values);
  const deployed = useInitializerDeployed();

  return (
    <>
      {Object.keys(initializer).length > 0 && (
        <SlCard className="w-full">
          <div
            slot="header"
            className="flex flex-row items-center justify-between"
          >
            <div>{name}</div>
            <SlButton
              variant={deployed ? 'default' : 'success'}
              outline={!deployed}
              size="small"
              onClick={() => deploy()}
            >
              {deployed ? 'Re-deploy' : 'Deploy'}
            </SlButton>
          </div>
          <ul className="fn-list">
            <li>{values.function}</li>
          </ul>
        </SlCard>
      )}
    </>
  );
}

export default InitializerCard;
