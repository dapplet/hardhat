import { SlCard, SlIcon, SlSwitch } from '@shoelace-style/shoelace/dist/react';
import * as React from 'react';
import { useDeployFacet } from '../../lib/hooks/useDeployFacet';
// import { useFacetDeployed } from '../../hooks/useFacetDeployed';
import { useFacetDeployed } from '../../lib/stores/dapplet';

interface FacetCardProps {
  name: string;
  facet: any;
}

function FacetCard({ name, facet }: FacetCardProps) {
  const deploy = useDeployFacet(name, facet);
  const deployed = useFacetDeployed(name);

  const fns = facet.abi
    .map((fn: any) => {
      if (
        fn.type !== 'receive' &&
        fn.type !== 'fallback' &&
        fn.type !== 'event' &&
        fn.type !== 'error' &&
        fn.type !== 'constructor'
      ) {
        return (
          fn.name +
          '(' +
          fn.inputs?.map((input: any) => input.type).join(',') +
          ')'
        );
      }
    })
    .filter((fn: any) => fn !== undefined);

  return (
    <SlCard>
      {facet && (
        <>
          <div
            slot="header"
            className="flex flex-row items-center justify-between"
          >
            <div>{name}</div>
          </div>
          {/* ChooseSelectors */}
          <div className="flex flex-col gap-4">
            {fns?.map((fn: any, i: number) => (
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-3">
                  <SlIcon name="arrow-return-right" />
                  <div key={i}>{fn}</div>
                </div>
                <SlSwitch checked disabled />
              </div>
            ))}
          </div>
        </>
      )}
    </SlCard>
  );
}

export default FacetCard;
