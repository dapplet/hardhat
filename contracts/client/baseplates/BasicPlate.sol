// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Baseplate, IBaseplate } from '../inherited/Baseplate.sol';
import { IDiamondReadable } from '@solidstate/contracts/proxy/diamond/readable/IDiamondReadable.sol';
import { ERC165Base, IERC165, ERC165BaseStorage } from '@solidstate/contracts/introspection/ERC165/base/ERC165Base.sol';
import { SafeOwnable, ISafeOwnable, OwnableInternal } from '@solidstate/contracts/access/ownable/SafeOwnable.sol';

// import 'hardhat/console.sol';

contract BasicPlate is Baseplate, ERC165Base, SafeOwnable {
  using ERC165BaseStorage for ERC165BaseStorage.Layout;

  constructor(address _sys) Baseplate(_sys) {}

  function init(address _creator, bytes32 _baseplateId) external override {
    _init(_creator, _baseplateId);
    ERC165BaseStorage.Layout storage l = ERC165BaseStorage.layout();
    l.supportedInterfaces[type(IBaseplate).interfaceId] = true;
    l.supportedInterfaces[type(IDiamondReadable).interfaceId] = true;
    l.supportedInterfaces[type(ISafeOwnable).interfaceId] = true;
    l.supportedInterfaces[type(IERC165).interfaceId] = true;
  }

  function _transferOwnership(address _newOwner) internal override(OwnableInternal, SafeOwnable) {
    OwnableInternal._transferOwnership(_newOwner);
  }

  receive() external payable {}
}