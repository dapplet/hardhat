import { ethers } from 'ethers';
import { urlParams } from '../types';

export const costOf = {
  createPkg: ethers.utils.parseEther('0.01'),
  createClient: ethers.utils.parseEther('0.01'),
  install: ethers.utils.parseEther('0.001'),
};

export const gateways: urlParams[] = [
  {
    prefix: 'https://',
    suffix: '.ipfs.w3s.link/',
  },
  {
    prefix: 'https://ipfs.io/ipfs/',
    suffix: '',
  },
  {
    prefix: 'https://gateway.ipfs.io/ipfs/',
    suffix: '',
  },
];
