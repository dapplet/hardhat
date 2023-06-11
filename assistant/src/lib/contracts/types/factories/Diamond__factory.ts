/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  Diamond,
  DiamondInterface,
  IDiamondWritableInternal,
} from "../Diamond";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "enum IDiamondWritableInternal.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "selectors",
            type: "bytes4[]",
          },
        ],
        internalType: "struct IDiamondWritableInternal.FacetCut[]",
        name: "_cuts",
        type: "tuple[]",
      },
      {
        internalType: "address",
        name: "_target",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "DiamondWritable__InvalidInitializationParameters",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__RemoveTargetNotZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__ReplaceTargetIsIdentical",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__SelectorAlreadyAdded",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__SelectorIsImmutable",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__SelectorNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__SelectorNotSpecified",
    type: "error",
  },
  {
    inputs: [],
    name: "DiamondWritable__TargetHasNoCode",
    type: "error",
  },
  {
    inputs: [],
    name: "Ownable__NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Ownable__NotTransitiveOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Proxy__ImplementationIsNotContract",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "enum IDiamondWritableInternal.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "selectors",
            type: "bytes4[]",
          },
        ],
        indexed: false,
        internalType: "struct IDiamondWritableInternal.FacetCut[]",
        name: "facetCuts",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "DiamondCut",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

export class Diamond__factory {
  static readonly abi = _abi;
  static createInterface(): DiamondInterface {
    return new utils.Interface(_abi) as DiamondInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Diamond {
    return new Contract(address, _abi, signerOrProvider) as Diamond;
  }
}
