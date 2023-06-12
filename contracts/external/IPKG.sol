// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';

interface IPKG {

  enum VARIANT { INSTALL, UNINSTALL }

  struct UPGRADE {
    IDiamondWritable.FacetCut[] cuts;
    address target;
    bytes4 selector;
  }

  /**
   * 
   * @notice set the pkg's upgrade data
   * @param _cuts the pkg's facet cuts
   * @param _target the pkg's target address
   * @param _selector the pkg's target selector
   */
  function set(
    IDiamondWritable.FacetCut[] memory _cuts,
    address _target,
    bytes4 _selector
  ) external;

  /**
   * 
   * @notice get the pkg's upgrade data
   * @param action the action to perform (install or uninstall)
   * @return cuts the pkg's facet cuts
   * @return target the pkg's target address
   * @return selector the pkg's target selector
   */
  function get(VARIANT action) external view returns (
    IDiamondWritable.FacetCut[] memory cuts, 
    address target, 
    bytes4 selector
  );
}
