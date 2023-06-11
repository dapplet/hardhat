import {
  SlBadge,
  SlCard,
  SlDetails,
  SlIcon,
} from '@shoelace-style/shoelace/dist/react';
import { shortenAddress } from '@usedapp/core';
import * as React from 'react';
import { useInstalledBy, useIsInstalled } from '../../lib/hooks/useInstallPkg';
import {
  useDappletStore,
  useUpgradeAddressDeployed,
} from '../../lib/stores/dapplet';
import PkgCard from '../molecules/PkgCard';

function Installation() {
  const installs = useInstalledBy();
  console.log('asdf installs', installs);

  const installed = useIsInstalled();
  console.log('asdf installed', installed);

  const created = useUpgradeAddressDeployed();
  const waiting = !created;

  const { client, upgrade } = useDappletStore();

  return (
    <>
      <SlDetails disabled={waiting}>
        <div
          className="flex flex-row items-center justify-between w-full"
          slot="summary"
        >
          <div>Installation</div>
          <SlBadge
            variant={installed ? 'neutral' : !created ? 'warning' : 'success'}
            pill
            style={{ marginRight: '1rem' }}
            pulse={!installed && created}
          >
            {installed ? 'installed' : !created ? 'waiting' : 'ready'}
          </SlBadge>
          {/* </SlBadge> */}
        </div>
        <SlCard className="w-full">
          <div slot="header" className="flex flex-row items-center gap-3">
            <SlIcon name="app-indicator" />
            <div>{client.address && shortenAddress(client.address)}</div>
          </div>
          <div className="flex flex-col gap-5">
            {created && !installed && upgrade.address && (
              <PkgCard pkg={upgrade.address} local={true} />
            )}
            {installs?.map((pkg, i) => (
              <PkgCard pkg={pkg} local={false} key={i} />
            ))}
          </div>
        </SlCard>
      </SlDetails>
    </>
  );
}

export default Installation;
