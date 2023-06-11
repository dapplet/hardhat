/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IInstaller, IInstallerInterface } from "../IInstaller";

const _abi = [
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
    inputs: [
      {
        components: [
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
            name: "cuts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4",
          },
        ],
        internalType: "struct IPKG.UPGRADE",
        name: "_pkg",
        type: "tuple",
      },
      {
        internalType: "string",
        name: "_ipfsCid",
        type: "string",
      },
    ],
    name: "create",
    outputs: [
      {
        internalType: "address",
        name: "pkg",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
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
        internalType: "struct IDiamondWritableInternal.FacetCut[]",
        name: "facetCuts",
        type: "tuple[]",
      },
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "diamondCut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pkg",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "install",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pkg",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "uninstall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IInstaller__factory {
  static readonly abi = _abi;
  static createInterface(): IInstallerInterface {
    return new utils.Interface(_abi) as IInstallerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IInstaller {
    return new Contract(address, _abi, signerOrProvider) as IInstaller;
  }
}