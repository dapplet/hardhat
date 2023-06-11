
import { Falsy, Params, QueryParams, TransactionOptions, TypedFilter, useCall, useContractFunction, useLogs } from '@usedapp/core'
import { Contract, utils } from 'ethers'

import { OwnershipFacet, OwnershipFacet__factory } from '../types'
const OwnershipFacetInterface = new utils.Interface(OwnershipFacet__factory.abi)


export const useOwnershipFacet_acceptOwnership = (
  contractAddress: Falsy | string,
  options?: TransactionOptions
) => {
  return useContractFunction<OwnershipFacet, 'acceptOwnership'>(
    contractAddress && new Contract(contractAddress, OwnershipFacetInterface) as OwnershipFacet,
    'acceptOwnership',
    options
  )
}


export const useOwnershipFacet_nomineeOwner = (
  contractAddress: Falsy | string,
  args: Falsy | Params<OwnershipFacet, 'nomineeOwner'>,
  queryParams: QueryParams = {}
) => {
  return useCall<OwnershipFacet, 'nomineeOwner'>(
    contractAddress
      && args
      && {
        contract: new Contract(contractAddress, OwnershipFacetInterface) as OwnershipFacet,
        method: 'nomineeOwner',
        args
      }, queryParams
  )
}


export const useOwnershipFacet_owner = (
  contractAddress: Falsy | string,
  args: Falsy | Params<OwnershipFacet, 'owner'>,
  queryParams: QueryParams = {}
) => {
  return useCall<OwnershipFacet, 'owner'>(
    contractAddress
      && args
      && {
        contract: new Contract(contractAddress, OwnershipFacetInterface) as OwnershipFacet,
        method: 'owner',
        args
      }, queryParams
  )
}


export const useOwnershipFacet_transferOwnership = (
  contractAddress: Falsy | string,
  options?: TransactionOptions
) => {
  return useContractFunction<OwnershipFacet, 'transferOwnership'>(
    contractAddress && new Contract(contractAddress, OwnershipFacetInterface) as OwnershipFacet,
    'transferOwnership',
    options
  )
}


export const useOwnershipFacet_event_OwnershipTransferred = (
  contractAddress: Falsy | string,
  args: Falsy | TypedFilter<OwnershipFacet, 'OwnershipTransferred'>['args'],
  queryParams: QueryParams = {}
) => {
  return useLogs(
    contractAddress
      && {
        contract: new Contract(contractAddress, OwnershipFacetInterface),
        event: 'OwnershipTransferred',
        args: args || [],
      },
    queryParams
  )
}


export const useOwnershipFacet = {
  acceptOwnership: useOwnershipFacet_acceptOwnership,
  nomineeOwner: useOwnershipFacet_nomineeOwner,
  owner: useOwnershipFacet_owner,
  transferOwnership: useOwnershipFacet_transferOwnership,
  events: {
    OwnershipTransferred: useOwnershipFacet_event_OwnershipTransferred
  }
}
