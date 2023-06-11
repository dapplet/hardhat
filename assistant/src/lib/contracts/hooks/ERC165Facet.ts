
import { Falsy, Params, QueryParams, TransactionOptions, TypedFilter, useCall, useContractFunction, useLogs } from '@usedapp/core'
import { Contract, utils } from 'ethers'

import { ERC165Facet, ERC165Facet__factory } from '../types'
const ERC165FacetInterface = new utils.Interface(ERC165Facet__factory.abi)


export const useERC165Facet_supportsInterface = (
  contractAddress: Falsy | string,
  args: Falsy | Params<ERC165Facet, 'supportsInterface'>,
  queryParams: QueryParams = {}
) => {
  return useCall<ERC165Facet, 'supportsInterface'>(
    contractAddress
      && args
      && {
        contract: new Contract(contractAddress, ERC165FacetInterface) as ERC165Facet,
        method: 'supportsInterface',
        args
      }, queryParams
  )
}


export const useERC165Facet = {
  supportsInterface: useERC165Facet_supportsInterface,
  events: {
  
  }
}
