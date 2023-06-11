import SlInputElement from '@shoelace-style/shoelace/dist/components/input/input';
import {
  SlBadge,
  SlButton,
  SlCard,
  SlDetails,
  SlInput,
} from '@shoelace-style/shoelace/dist/react';
import { ethers } from 'ethers';
import * as React from 'react';
import { useCreatePkg } from '../../lib/hooks/useCreatePkg';
import {
  useDappletStore,
  useUpgradeAddressDeployed,
} from '../../lib/stores/dapplet';
import FacetCard from '../molecules/FacetCard';

function Registration() {
  const store = useDappletStore();
  const facets = store?.upgrade?.facets;
  const facetNames = facets.map((f) => Object.keys(f)[0]);
  const facetValues = facets.map((f) => Object.values(f)[0]);
  const initializer = store?.upgrade?.initializer;
  const name = store?.name;

  const waiting =
    facetValues.filter((f) => !f.isDeployed).length > 0 ||
    (initializer?.target !== ethers.constants.AddressZero &&
      !initializer?.isDeployed);

  const { send: create } = useCreatePkg();

  const created = useUpgradeAddressDeployed();

  return (
    <>
      <SlDetails disabled={waiting}>
        <div
          className="flex flex-row items-center justify-between w-full"
          slot="summary"
        >
          <div>Registration</div>
          <SlBadge
            variant={waiting ? 'warning' : created ? 'neutral' : 'success'}
            pill
            style={{ marginRight: '1rem' }}
            pulse={!created && !waiting}
          >
            {waiting ? 'waiting' : created ? 'created' : 'ready'}
          </SlBadge>
        </div>
        <SlCard className="w-full creation-card">
          <div
            slot="header"
            className="flex flex-row items-center justify-between"
          >
            <div>{name}</div>
            <SlButton
              variant={created ? 'default' : 'success'}
              outline={!created}
              size="small"
              onClick={() => create()}
            >
              {created ? 'Re-create' : 'Create'}
            </SlButton>
          </div>
          <SlInput
            className="w-full"
            value={store?.CID}
            placeholder="Qm..."
            helpText="Add IPFS hash if publishing to live network"
            onSlInput={(e) => {
              store?.setCID((e.target as SlInputElement).value);
            }}
            /* required */
            /* pattern="^(Qm[1-9A-HJ-NP-Za-km-z]{46}|b[0-9A-HJ-NP-Za-km-z]{59})$" */
          />
          <div className="w-full flex flex-col gap-5">
            {facetNames.map((name, i) => (
              <FacetCard name={name} facet={facetValues[i]} />
            ))}
            {/* {initValues && (
              <>
                <SlDivider />
                <h3>Initializer:</h3>
                <li>{initValues?.function}</li>
              </>
            )} */}
          </div>
        </SlCard>
      </SlDetails>
    </>
  );
}

export default Registration;
