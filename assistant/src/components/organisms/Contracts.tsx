import {
  SlBadge,
  SlDetails,
  SlDivider,
} from '@shoelace-style/shoelace/dist/react';
import { ethers } from 'ethers';
import * as React from 'react';
import { useDappletStore } from '../../lib/stores/dapplet';
import ContractCard from '../molecules/ContractCard';
import InitializerCard from '../molecules/InitializerCard';

function Contracts() {
  const store = useDappletStore();
  const facets = store?.upgrade?.facets;
  const facetNames = facets.map((f) => Object.keys(f)[0]);
  const facetValues = facets.map((f) => Object.values(f)[0]);
  const initializer = store?.upgrade?.initializer;
  const initializerIsDeployed =
    initializer?.target !== ethers.constants.AddressZero &&
    initializer?.isDeployed;
  const facetsRemaining =
    facetValues.length - facetValues.filter((f) => f.isDeployed).length;

  const remaining = initializerIsDeployed
    ? facetsRemaining + 1
    : facetsRemaining;

  return (
    <SlDetails>
      <div
        slot="summary"
        className="flex flex-row items-center justify-between w-full"
      >
        <div>Contracts</div>
        <SlBadge
          variant={remaining > 0 ? 'success' : 'neutral'}
          pill
          pulse={remaining > 0}
          style={{ marginRight: '1rem' }}
        >
          {remaining > 0 ? `${remaining}` : 'deployed'}
        </SlBadge>
      </div>
      <div className="flex flex-col gap-2 text-left">
        {facetNames.map((name, i) => (
          <ContractCard name={name} value={facetValues[i]} />
        ))}
      </div>
      {initializer?.target &&
        initializer?.target !== ethers.constants.AddressZero && (
          <>
            <SlDivider />
            <div className="flex flex-col gap-2 text-left">
              <InitializerCard />
            </div>
          </>
        )}
    </SlDetails>
  );
}

export default Contracts;
