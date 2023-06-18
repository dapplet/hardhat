// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SystemStorage } from '../storage/SystemStorage.sol';

contract ViewerFacet {
  using SystemStorage for SystemStorage.Layout;

  /**
   * 
   * @param pkg the address of the package to check
   * @return isPkg whether the package is installed
   */
  function isPkg(address pkg) external view returns (bool) {
   return SystemStorage.layout().isPkg(pkg);
  }

  /**
   * 
   * @param pkg the address of the package to check
   * @return owner the address of the owner of the package
   */
  function ownerOf(address pkg) external view returns (address owner) {
    owner = SystemStorage.layout().ownerOf(pkg);
  }

  /**
   * 
   * @param account the address of the account to check
   * @return pkgs the list of packages owned by the account
   */
  function ownedBy(address account) external view returns (address[] memory pkgs) {
    pkgs = SystemStorage.layout().ownedBy(account);
  }

  /**
   * 
   * @param pkgs the addresses of the packages to check
   * @return metadata the metadata of each package (IPFS CIDs)
   */
  function metadataOf(address[] memory pkgs) external view returns (string[] memory metadata) {
    metadata = SystemStorage.layout().metadataOf(pkgs);
  }

  /**
   * 
   * @param account the address of the account to check
   * @return pkgs the list of packages installed by the account
   */
  function installedBy(address account) external view returns (address[] memory pkgs) {
    pkgs = SystemStorage.layout().installedBy(account);
  }

  /**
   * 
   * @param pkg the address of the package to check
   * @param baseplateId the caller's encoded baseplate type
   */
  function installersOf(address pkg, bytes32 baseplateId) external view returns (address[] memory installers) {
    installers = SystemStorage.layout().installersOf(pkg, baseplateId);
  }

  /**
   * 
   * @param _baseplate the caller's baseplate type as a string
   * @return baseplate the address of the baseplate
   */
  function getBaseplate(string memory _baseplate) external view returns (address baseplate) {
    bytes32 id = keccak256(abi.encodePacked(_baseplate));
    baseplate = SystemStorage.layout().getBaseplate(id);
  }

  /**
   * 
   * @param _baseplateId the caller's baseplateId, encoded offchain from the baseplate string
   * @return baseplate the address of the baseplate
   */
  function getBaseplate(bytes32 _baseplateId) external view returns (address baseplate) {
    baseplate = SystemStorage.layout().getBaseplate(_baseplateId);
  }

}