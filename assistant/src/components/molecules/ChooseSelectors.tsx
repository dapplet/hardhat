// import type SlCheckboxElement from '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
// import { SlAlert, SlCheckbox } from '@shoelace-style/shoelace/dist/react';
// import { Interface, isAddress } from 'ethers/lib/utils';
// import React, { useMemo } from 'react';
// import { useInterface, useSelectors } from '../../hooks';
// import { useFacetCutsStore } from '../../stores/dapplet';
import * as React from 'react';

function ChooseSelectors({ facet, config }: { facet: string; config: any }) {
  // //0x30e1779c7038603dF3E997650D5cceF5CEb9f20c

  // //0x64524FcbD1e33a8a963232Bfdc67d997290D31b3

  // const { cuts, addFacetCut, removeFacetByTarget, removeSelector } =
  //   useFacetCutsStore();

  // const isValid = facet?.match(/^0x[a-fA-F0-9]{40}$/g) && isAddress(facet);
  // // const metadata = useContractMetadata(facet as string) || {};
  // const metadata = config.facets?.[facet] || {};
  // const iface = useInterface(metadata?.output?.abi) || undefined;
  // const { selectors, fragments } = useSelectors(iface as Interface);

  // useMemo(() => {
  //   if (!isValid) {
  //     removeFacetByTarget(facet as string);
  //   }
  // }, [selectors]);

  // const facetCut = cuts.find((cut) => cut.target === facet);

  // useMemo(() => {
  //   if (facet && isValid && (!facetCut || facetCut?.selectors.length === 0)) {
  //     addFacetCut({
  //       target: facet,
  //       action: 0,
  //       selectors: selectors,
  //     });
  //   }
  // }, [selectors]);

  // function handleChange(e: any, item: any) {
  //   if (facet) {
  //     if ((e.target as SlCheckboxElement).checked) {
  //       addFacetCut({
  //         target: facet,
  //         action: 0,
  //         selectors: [
  //           ...(cuts.find((c) => c.target === facet)?.selectors || []),
  //           item,
  //         ],
  //       });
  //     }
  //     if (!(e.target as SlCheckboxElement).checked) {
  //       removeSelector(facet, item);
  //     }
  //   }
  // }

  return (
    <>
      {/* {isValid && (
        <div slot="footer">
          {iface ? (
            <>
              {selectors.map((selector, i) => (
                <div className="flex flex-row items-center p-1" key={i}>
                  <SlCheckbox
                    checked={facetCut?.selectors.includes(selector)}
                    onSlChange={(e) => handleChange(e, selector)}
                  />
                  <span>
                    {fragments?.[i].name}
                    {`(${fragments?.[i].inputs
                      .map((input) => input.type)
                      .join(', ')})`}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              <SlAlert variant="danger" slot="footer" open>
                <strong>ABI not found</strong>
                <p>
                  Add the contract's metadata to IPFS.{' '}
                  <a
                    href="https://docs.dapplet.app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Learn more
                  </a>
                  .
                </p>
              </SlAlert>
            </>
          )}
        </div>
      )} */}
    </>
  );
}

export default ChooseSelectors;
