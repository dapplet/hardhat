// import type SlInputElement from '@shoelace-style/shoelace/dist/components/input/input';
// import {
//   SlButton,
//   SlCard,
//   SlIcon,
//   SlInput,
// } from '@shoelace-style/shoelace/dist/react';
// import React, { useState } from 'react';
// import { useFacetCutsStore } from '../../stores/dapplet';
// import ChooseSelectors from '../molecules/ChooseSelectors';
import * as React from 'react';

function FacetManager({ config }: { config: any }) {
  // const [facets, setFacets] = useState<string[]>(['']);

  // const { cuts, addFacetCut, removeFacetByTarget, removeSelector } =
  //   useFacetCutsStore();

  // function addFacet() {
  //   setFacets([...facets, '']);
  // }

  // function removeFacet(index: number, facet: string) {
  //   setFacets(facets.filter((_, i) => i !== index));
  //   removeFacetByTarget(facet);
  // }

  // function changeFacet(index: number, value: string) {
  //   setFacets(facets.map((facet, i) => (i === index ? value : facet)));
  // }
  return (
    <div className="flex flex-col gap-2">
      {/* Facets *
      {facets?.map((facet, i) => (
        <SlCard className="flex flex-col gap-2" key={i}>
          <div className="flex items-center justify-between w-full gap-4">
            <SlInput
              placeholder={`0x...`}
              type="search"
              inputmode="search"
              enterkeyhint="search"
              className="w-full"
              required
              // pattern="/^0x[a-fA-F0-9]{40}$/g"
              onInput={(e) =>
                changeFacet(i, (e.target as SlInputElement).value)
              }
            />
            <SlButton onClick={() => removeFacet(i, facet)}>
              <SlIcon name="trash" slot="suffix" />
            </SlButton>
          </div>
          <div className="flex items-center gap-2" key={i}></div>
          <ChooseSelectors facet={facet} config={config} />
        </SlCard>
      ))}
      <div className="flex items-center justify-center w-full p-5">
        <SlButton variant="default" size="large" circle onClick={addFacet}>
          <SlIcon name="plus"></SlIcon>
        </SlButton>
      </div> */}
    </div>
  );
}

export default FacetManager;
