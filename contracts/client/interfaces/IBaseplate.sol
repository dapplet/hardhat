// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IPKG } from '../../external/IPKG.sol';
import { IDiamondReadable } from '@solidstate/contracts/proxy/diamond/readable/IDiamondReadable.sol';
import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

interface IBaseplate is IDiamondReadable, IDiamondWritable {

  event DappletUpgrade (address indexed pkg, bool indexed install);

  receive() external payable;

  /**
   * 
   * @notice install a pkg to the client, served by the system
   * @param _pkg the pkg to install
   * @param _data the initializable data to pass to the pkg's EIP-2535 upgrade initializer
   * @dev this function is only callable by the owner
   */
  function install(address _pkg, bytes memory _data) external payable;

  /**
   * 
   * @notice uninstall a pkg from the client, served by the system
   * @param _pkg the pkg to uninstall
   * @param _data the initializable data to pass to the pkg's EIP-2535 upgrade initializer
   * @dev this function is only callable by the owner
   */
  function uninstall(address _pkg, bytes memory _data) external;

  /**
   * 
   * @notice create a new pkg
   * @param _pkg the pkg's initial upgrade data
   * @param _ipfsCid the pkg's IPFS CID for metadata - usually a JSON file pointing to a js module
   * @return pkg the address of the created pkg
   * @dev this function is only callable by the owner
   */
  function create(
    IPKG.UPGRADE memory _pkg,
    string memory _ipfsCid
  ) external payable returns (address pkg);
}
