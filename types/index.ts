export interface IDeployment {
  [key: string]: {
    address: string;
    abi?: any | null;
    cid?: string;
  };
}
export interface IDeployments {
  [key: number]: IDeployment;
}

export interface IFacetCut {
  target: string;
  action: number;
  selectors: string[];
}

export interface IPKGCUT {
  cuts: IFacetCut[];
  target: string;
  selector: string;
}

export interface urlParams {
  prefix: string;
  suffix: string;
}
