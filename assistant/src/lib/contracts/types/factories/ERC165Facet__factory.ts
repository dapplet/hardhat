/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ERC165Facet, ERC165FacetInterface } from "../ERC165Facet";

const _abi = [
  {
    inputs: [],
    name: "ERC165Base__InvalidInterfaceId",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

export class ERC165Facet__factory {
  static readonly abi = _abi;
  static createInterface(): ERC165FacetInterface {
    return new utils.Interface(_abi) as ERC165FacetInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ERC165Facet {
    return new Contract(address, _abi, signerOrProvider) as ERC165Facet;
  }
}