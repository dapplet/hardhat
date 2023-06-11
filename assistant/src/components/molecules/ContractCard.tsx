import { SlButton, SlCard } from '@shoelace-style/shoelace/dist/react';
import * as React from 'react';
import { useDeployFacet } from '../../lib/hooks/useDeployFacet';
// import { useFacetDeployed } from '../../hooks/useFacetDeployed';
import { useFacetDeployed } from '../../lib/stores/dapplet';

interface ContractCardProps {
  name: string;
  value: any;
}

function ContractCard({ name, value }: ContractCardProps) {
  const deploy = useDeployFacet(name, value);
  const deployed = useFacetDeployed(name);

  return (
    <SlCard>
      {value && (
        <>
          <div className="flex flex-row items-center justify-between">
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
        </>
      )}
    </SlCard>
  );
}

export default ContractCard;
