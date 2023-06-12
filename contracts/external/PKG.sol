// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IDiamondWritableInternal } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritableInternal.sol';

import { IDiamondWritable } from '@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol';
import { MinimalProxyFactory } from '@solidstate/contracts/factory/MinimalProxyFactory.sol';
import { OwnableInternal } from '@solidstate/contracts/access/ownable/OwnableInternal.sol';
import { IPKG } from './IPKG.sol';

// import 'hardhat/console.sol';

contract PKG is IPKG, IDiamondWritableInternal { 

    bool private initialized;
    IPKG.UPGRADE public pkg;

    /**
     * @inheritdoc IPKG
     */
    function set(
        FacetCut[] memory _cuts,
        address _target,
        bytes4 _selector
    ) external {
        require(!initialized, "PKG: already initialized.");

        uint256 n = _cuts.length;
        FacetCut memory c;
        for (uint256 i = 0; i < n; i++) {
            c = _cuts[i];
            require(
                c.action == FacetCutAction.ADD,
                "PKG: only add actions allowed."
            );
            pkg.cuts.push(FacetCut(c.target, c.action, c.selectors));
        }
        pkg.target = _target;
        pkg.selector = _selector;

        initialized = true;
    }

    /**
     * @inheritdoc IPKG
     */
    function get(
        IPKG.VARIANT action
    ) external view returns (FacetCut[] memory cuts, address target, bytes4 selector) {
        if (action == IPKG.VARIANT.INSTALL) {
            cuts = pkg.cuts;
            target = pkg.target;
            selector = pkg.selector;
        } else if (action == IPKG.VARIANT.UNINSTALL) {
            uint n = pkg.cuts.length;
            cuts = new FacetCut[](n);
            for (uint i; i < n; i++) {
                cuts[i] = FacetCut({
                    target: address(0),
                    action: FacetCutAction.REMOVE,
                    selectors: pkg.cuts[i].selectors
                });
            }
            target = address(0);
            selector = bytes4(0);
        }
    }
}