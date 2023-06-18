// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IOperator } from '../interfaces/IOperator.sol';
import { OwnableInternal } from '@solidstate/contracts/access/ownable/OwnableInternal.sol';
import { AccessControlInternal } from '@solidstate/contracts/access/access_control/AccessControlInternal.sol';
import { MinimalProxyFactory } from '@solidstate/contracts/factory/MinimalProxyFactory.sol';

import { SystemStorage } from '../storage/SystemStorage.sol';

import { PKG, IPKG } from '../../external/PKG.sol';
import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

// import 'hardhat/console.sol';

contract OperatorFacet is IOperator, OwnableInternal, AccessControlInternal, MinimalProxyFactory {
  using SystemStorage for SystemStorage.Layout;

  // event NewBaseplate  (bytes32 indexed baseplateId, address indexed baseplate);
  // event ClientCreated (bytes32 indexed baseplateId, address indexed client);
  // event PackageCreated (address indexed pkg, address indexed creator);
  // event ClientUpgraded (address indexed pkg, address indexed client, address indexed caller, bool install);

  address immutable template;

  constructor() {
    // create pkg template
    PKG instance = new PKG();
    template = address(instance);
    IPKG(template).set(new IDiamondWritable.FacetCut[](0), address(0), bytes4(0));
  }

  modifier toSystem() {
    // require msg.value > system fee
    // send to system owner
    _;
  }

  modifier toPkg() {
    // require msg.value > pkg fee
    // send fee to pkg and track pkg balances
    _;
  }

  /**
   * @inheritdoc IOperator
   */
  function createClient(bytes32 _baseplateId) external payable toSystem returns (address) {
    // create client from baseplate and init
    address baseplate = SystemStorage.layout().getBaseplate(_baseplateId);
    address client = _deployMinimalProxy(baseplate);
    (bool success, ) = client.call(abi.encodeWithSignature("init(address,bytes32)", msg.sender, _baseplateId));
    require(success, "Operator: client baseplate init failed");

    _grantRole(_baseplateId, client);

    emit ClientCreated(_baseplateId, client);
    return client;
  }

  /**
   * @inheritdoc IOperator
   */
  function createPkg(
    IPKG.UPGRADE memory _pkg,
    string memory _ipfsCid,
    bytes32 _baseplateId
  ) external payable toSystem onlyRole(_baseplateId) returns (address) {
    // create pkg
    address pkg = _deployMinimalProxy(template);
    IPKG(pkg).set(_pkg.cuts, _pkg.target, _pkg.selector);

    // store pkg and its metadata
    SystemStorage.Layout storage l = SystemStorage.layout();
    l.createPkg(pkg, msg.sender);
    l.setMetadata(pkg, _ipfsCid);

    emit PackageCreated(pkg, msg.sender);
    return pkg;
  }

  /**
   * @inheritdoc IOperator
   */
  function installPkg(
    address _pkg, 
    address _caller, 
    bytes4 initFn,
    bytes memory data,
    bytes32 _baseplateId
  ) external payable toPkg onlyRole(_baseplateId) {
    SystemStorage.layout().installPkg(_pkg, msg.sender);

    // fetch pkg contents
    (IDiamondWritable.FacetCut[] memory cuts, address target, bytes4 selector) = IPKG(_pkg).get(IPKG.VARIANT.INSTALL);

    //make upgrade
    if (cuts.length > 0 ) {
      if (initFn != bytes4(0) && data.length > 0) {
        require(
          selector == initFn,
          "Operator: invalid initializer function called."
        );
        IDiamondWritable(msg.sender).diamondCut(cuts, target, data);
      } else {
        IDiamondWritable(msg.sender).diamondCut(cuts, address(0), '');
      }
    }

    emit ClientUpgraded(_pkg, msg.sender, _caller, true);
  }

  /**
   * @inheritdoc IOperator
   */
  function uninstallPkg(
    address _pkg, 
    address _caller, 
    bytes4 initFn,
    bytes memory data,
    bytes32 _baseplateId
  ) external onlyRole(_baseplateId) {
    SystemStorage.layout().uninstallPkg(_pkg, msg.sender);

    // fetch pkg contents
    (IDiamondWritable.FacetCut[] memory cuts, address target, bytes4 selector) = IPKG(_pkg).get(IPKG.VARIANT.UNINSTALL);

    //make upgrade
    if (cuts.length > 0 ) {
      if (initFn != bytes4(0) && data.length > 0) {
        require(
          selector == initFn,
          "Operator: invalid initializer function called."
        );
        IDiamondWritable(msg.sender).diamondCut(cuts, target, data);
      } else {
        IDiamondWritable(msg.sender).diamondCut(cuts, address(0), '');
      }
    }

    emit ClientUpgraded(_pkg, msg.sender, _caller, false);
  }
}