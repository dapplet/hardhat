import { SlButton, SlCard, SlIcon } from '@shoelace-style/shoelace/dist/react';
import { shortenAddress } from '@usedapp/core';
import * as React from 'react';
import { useInstallPkg, useUninstallPkg } from '../../lib/hooks/useInstallPkg';
import { useGetPkg } from '../../lib/stores/dapplet';

function PkgCard({ pkg, local }: { pkg: string; local: boolean }) {
  const get = useGetPkg(pkg);

  const { send: install } = useInstallPkg();
  const { send: uninstall } = useUninstallPkg();

  return (
    <SlCard>
      <div
        className="flex flex-row items-center justify-between gap-2"
        slot="header"
      >
        <SlIcon name="box" />
        <div>{pkg && shortenAddress(pkg)}</div>
        <SlButton
          variant={local ? 'success' : 'danger'}
          outline
          size="small"
          onClick={() => (local ? install() : uninstall(pkg))}
        >
          {local ? 'Install' : 'Uninstall'}
        </SlButton>
      </div>
      <div className="flex flex-col gap-5">
        {get?.cuts?.map((cut, i) => (
          <SlCard key={i}>
            <div className="flex flex-row items-center gap-4" slot="header">
              <SlIcon name="gem" />
              <div>{cut.target && shortenAddress(cut.target)}</div>
            </div>
            <div>
              {cut.selectors.map((selector, j) => (
                <div className="flex flex-row items-center gap-2" key={j}>
                  <SlIcon name="arrow-return-right" />
                  <div>{selector}</div>
                </div>
              ))}
            </div>
          </SlCard>
        ))}
      </div>
    </SlCard>
  );
}

export default PkgCard;
