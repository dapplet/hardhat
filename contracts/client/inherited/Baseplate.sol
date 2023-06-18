// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IBaseplate } from '../interfaces/IBaseplate.sol';
import { OwnableInternal } from '@solidstate/contracts/access/ownable/OwnableInternal.sol';
import { DiamondBase } from '@solidstate/contracts/proxy/diamond/base/DiamondBase.sol';
import { DiamondReadable } from '@solidstate/contracts/proxy/diamond/readable/DiamondReadable.sol';
import { DiamondWritableInternal } from '@solidstate/contracts/proxy/diamond/writable/DiamondWritableInternal.sol';

import { IOperator } from '../../system/interfaces/IOperator.sol';

import { IPKG } from '../../external/IPKG.sol';

// import 'hardhat/console.sol';

abstract contract Baseplate is IBaseplate, OwnableInternal, DiamondBase, DiamondReadable, DiamondWritableInternal {

  /**
   * @notice the baseplate's unique identifier
   */
  bytes32 public baseplateId;

  /**
   * @notice the address of the system operator
   */
  address payable immutable operator;
  
  bool private initialized;

  constructor(address _sys) {
    operator = payable(_sys);
    _transferOwnership(msg.sender);
    initialized = true;
  }

  function init(address _creator, bytes32 _baseplateId) external virtual {
    _init(_creator, _baseplateId);
  }

  /**
   * 
   * @notice internal initializer to set baseplateId and owner
   */
  function _init(address _creator, bytes32 _baseplateId) internal {
    require(!initialized, "Proxy: already initialized");
    require(msg.sender == operator, "Baseplate: only callable by System");
    _transferOwnership(_creator); 
    baseplateId = _baseplateId;
    initialized = true;
  }

  /**
   * 
   * @inheritdoc IBaseplate
   */
  function install(address _pkg, bytes calldata data) external onlyOwner payable {
    bytes4 selector = bytes4(0);
    if (data.length > 0) {
      selector = bytes4(data[0:4]);
    }
    // call operator to install pkg, including baseplateId for verification
    (bool success, bytes memory result) = operator.call{value: msg.value}(
      abi.encodeWithSelector(
        IOperator.installPkg.selector,
        _pkg,
        msg.sender,
        selector,
        data,
        baseplateId
      )
    );
    require(success, string(result));
  }

  /**
   * 
   * @inheritdoc IBaseplate
   */
  function uninstall(address _pkg, bytes calldata data) external onlyOwner {
    bytes4 selector = bytes4(0);
    if (data.length > 0) {
      selector = bytes4(data[0:4]);
    }
    // call operator to uninstall pkg, including baseplateId for verification
    IOperator(operator).uninstallPkg(_pkg, msg.sender, selector, data, baseplateId);
  }

  /**
   * 
   * @inheritdoc IBaseplate
   */
  function create(
    IPKG.UPGRADE memory _pkg,
    string memory _ipfsCid
  ) external payable onlyOwner returns (address) {
    //call operator to create pkg, including baseplateId for verification
    (bool success, bytes memory result) = operator.call{value: msg.value}(
      abi.encodeWithSelector(IOperator.createPkg.selector, _pkg, _ipfsCid, msg.sender, baseplateId)
    );
    require(success, string(result));
    address pkg = abi.decode(result, (address));
    return pkg;
  }

  /**
   * 
   * @notice callback for pkg upgrades, overrides standard diamondCut with permission-check: see EIP-2535 by @mudgen
   */
  function diamondCut(
    FacetCut[] memory facetCuts,
    address target,
    bytes memory data
  ) external {
    require(msg.sender == operator, "Baseplate: only callable by System");
    _diamondCut(facetCuts, target, data);
  }
}