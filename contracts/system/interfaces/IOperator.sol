// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

import { IPKG } from '../../external/IPKG.sol';

interface IOperator {
  
  event NewBaseplate  (bytes32 indexed baseplateId, address indexed baseplate);
  event ClientCreated (bytes32 indexed baseplateId, address indexed client);
  event PackageCreated (address indexed pkg, address indexed creator);
  event ClientUpgraded (address indexed pkg, address indexed client, address indexed caller, bool install);

  /**
   * 
   * @notice create a client that can install and uninstall packages
   * @param _baseplateId the selected baseplate in which functionality will be extended
   * @return the address of the created client
   */
  function createClient(
    bytes32 _baseplateId
  ) external payable returns (address);

  /**
   * 
   * @notice called by the client's `create` function, this function creates a pkg and stores it in the system
   * @param _pkg the diamondCut upgrade to be stored as a pkg
   * @param _ipfsCid the ipfs cid of the pkg's metadata - usually a json file linking to a js module
   * @param _baseplateId automatically sent by the client and used to check permissions
   * @return pkg the address of the created pkg
   */
  function createPkg(
    IPKG.UPGRADE memory _pkg, 
    string memory _ipfsCid,
    bytes32 _baseplateId
  ) external payable returns (address pkg);

  /**
   * 
   * @notice called by the client's `install` function. installs a pkg on the client and extends functionality
   * @param _pkg the pkg to be installed
   * @param _caller the address of the client calling the function
   * @param initFn the function to be called on the pkg after it is installed (automatically sent)
   * @param data the data to be passed to the initFn
   * @param _baseplateId automatically sent by the client and used to check permission (automatically sent)
   */
  function installPkg(
    address _pkg, 
    address _caller, 
    bytes4 initFn,
    bytes memory data,
    bytes32 _baseplateId
  ) external payable;

  /**
   * 
   * @notice called by the client's `uninstall` function. uninstalls a pkg on the client and removes functionality
   * @param _pkg the pkg to be uninstalled
   * @param _caller the address of the client calling the function
   * @param initFn the function to be called on the pkg after it is uninstalled (automatically sent)
   * @param data the data to be passed to the initFn
   * @param _baseplateId automatically sent by the client and used to check permissions (automatically sent)
   */
  function uninstallPkg(
    address _pkg, 
    address _caller, 
    bytes4 initFn,
    bytes memory data,
    bytes32 _baseplateId
  ) external;
}