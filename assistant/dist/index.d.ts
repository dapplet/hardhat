import * as DappletShell from '@dapplet/shell';
import * as Ethers from 'ethers';
import * as UsedappCore from '@usedapp/core';
import * as Zustand from 'zustand';

declare module "IDiamondWritableInternal" {
  export type FacetCutStruct = {
    target: PromiseOrValue<string>;
    action: PromiseOrValue<Ethers.BigNumberish>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };

  export type FacetCutStruct___1 = {
    target: PromiseOrValue<string>;
    action: PromiseOrValue<Ethers.BigNumberish>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };

  export type FacetCutStruct___2 = {
    target: PromiseOrValue<string>;
    action: PromiseOrValue<Ethers.BigNumberish>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };

  export type FacetCutStructOutput = [string, number, Array<string>] & {
    target: string;
    action: number;
    selectors: Array<string>;
  };
}

declare module "IDiamondReadable" {
  export type FacetStruct = {
    target: PromiseOrValue<string>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };

  export type FacetStruct___1 = {
    target: PromiseOrValue<string>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };

  export type FacetStruct___2 = {
    target: PromiseOrValue<string>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };

  export type FacetStruct___3 = {
    target: PromiseOrValue<string>;
    selectors: Array<PromiseOrValue<Ethers.BytesLike>>;
  };
}

declare module "IPKG" {
  export type UPGRADEStructOutput = [Array<FacetCutStructOutput>, string, string] & {
    cuts: Array<FacetCutStructOutput>;
    target: string;
    selector: string;
  };

  export type UPGRADEStructOutput___1 = [Array<FacetCutStructOutput___1>, string, string] & {
    cuts: Array<FacetCutStructOutput___1>;
    target: string;
    selector: string;
  };

  export type UPGRADEStructOutput___2 = [Array<FacetCutStructOutput___2>, string, string] & {
    cuts: Array<FacetCutStructOutput___2>;
    target: string;
    selector: string;
  };

  export type UPGRADEStructOutput___3 = [Array<FacetCutStructOutput___3>, string, string] & {
    cuts: Array<FacetCutStructOutput___3>;
    target: string;
    selector: string;
  };
}