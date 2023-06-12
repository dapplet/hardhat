// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IPKG } from '../../external/IPKG.sol';
import { IDiamondReadable } from '@solidstate/contracts/proxy/diamond/readable/IDiamondReadable.sol';
import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

interface IBaseplate is IDiamondReadable, IDiamondWritable {

  /**
   * @notice the baseplate's unique identifier
   */
  bytes32 public baseplateId;

  /**
   * @notice the address of the system operator
   */
  address payable immutable operator;

  /**
   * 
   * @notice install a pkg to the client, served by the system
   * @param _pkg the pkg to install
   * @param data the initializable data to pass to the pkg's EIP-2535 upgrade initializer
   */
  function install(address _pkg, bytes memory _data) external payable;

  /**
   * 
   * @notice uninstall a pkg from the client, served by the system
   * @param _pkg the pkg to uninstall
   * @param data the initializable data to pass to the pkg's EIP-2535 upgrade initializer
   */
  function uninstall(address _pkg, bytes memory _data) external;

  /**
   * 
   * @notice create a new pkg
   * @param _pkg the pkg's initial upgrade data
   * @param _ipfsCid the pkg's IPFS CID for metadata - usually a JSON file pointing to a js module
   */
  function create(
    IPKG.UPGRADE memory _pkg,
    string memory _ipfsCid
  ) external payable returns (address pkg);
}
