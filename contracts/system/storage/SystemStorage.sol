// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { EnumerableMap } from '@solidstate/contracts/data/EnumerableMap.sol';
import { EnumerableSet} from '@solidstate/contracts/data/EnumerableSet.sol';

import { IERC20 } from '@solidstate/contracts/interfaces/IERC20.sol';
import { IERC4626 } from '@solidstate/contracts/interfaces/IERC4626.sol';

import { IPKG } from '../../external/IPKG.sol';

import { AccessControlStorage } from '@solidstate/contracts/access/access_control/AccessControlStorage.sol';

// import 'hardhat/console.sol';

library SystemStorage {
    using EnumerableMap for EnumerableMap.AddressToAddressMap;
    using EnumerableSet for EnumerableSet.AddressSet;
    using AccessControlStorage for AccessControlStorage.Layout;

    struct Layout {
        // slot => baseplate
        mapping(bytes32 => address) baseplate;

        // pkg => IPFS CID
        mapping(address => string) metadata;

        // pkg => owner-client
        EnumerableMap.AddressToAddressMap pkgs;
        
        //pkg => client => installed
        mapping(address => mapping(address => bool)) installed;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256('pkgs.storage.v1');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }

    function getBaseplate(Layout storage l, bytes32 baseplateId) internal view returns (address baseplate) {
        baseplate = l.baseplate[baseplateId];
        require(baseplate != address(0), 'DappsFacet: baseplate not found');
        return baseplate;
    }

    function setBaseplate(Layout storage l, bytes32 baseplateId, address addr) internal {
        l.baseplate[baseplateId] = addr;
        emit NewBaseplateAvailable(baseplateId);
    }

    function setMetadata(Layout storage l, address pkg, string memory metadata) internal {
      _validateMetadata(metadata);
      l.metadata[pkg] = metadata;
    }

    function metadataOf(Layout storage l, address[] memory pkgs) internal view returns (string[] memory metadata) {
        metadata = new string[](pkgs.length);
        for (uint i = 0; i < pkgs.length; i++) {
            address pkg = pkgs[i];
            metadata[i] = l.metadata[pkg];
        }
    }

    //TODO: solidity regex to validate IPFS CIDv1 or CIDv0 ???
    function _validateMetadata(string memory metadata) internal pure {
        require(
            bytes(metadata).length == 0 
            || bytes(metadata).length == 59 
            || bytes(metadata).length == 49,
            'PkgStorage: optional metadata is not IPFS CIDv1 or CIDv0'
        );
    }

    /**
     * @dev commit a pkg -- callable by anyone
     */

    function createPkg(Layout storage l, address pkg, address client) internal {
        l.pkgs.set(pkg, client);
        validatePkg(l, pkg);
    }

    function isPkg(Layout storage l, address pkg) internal view returns (bool) {
        return l.pkgs.contains(pkg);
    }

    function ownedBy(Layout storage l, address account) internal view returns (address[] memory pkgs) {
        for (uint256 i; i < l.pkgs.length(); i++) {
            (address pkg, address owner) = l.pkgs.at(i);
            if (owner == account) {
                pkgs[i] = pkg;
            }
        }
    }

    function ownerOf(Layout storage l, address pkg) internal view returns (address) {
        return l.pkgs.get(pkg);
    }

    function validatePkg(Layout storage l, address pkg) internal view {
        require(pkg != address(0) && isPkg(l, pkg), 'PkgStorage: invalid pkg');
    }

    function installPkg(Layout storage l, address pkg, address client) internal {
        validatePkg(l, pkg);
        bool installed = l.installed[pkg][client];
        require(!installed, 'PkgStorage: pkg already installed');
        l.installed[pkg][client] = true;
    }

    function uninstallPkg(Layout storage l, address pkg, address client) internal {
        bool installed = l.installed[pkg][client];
        require(installed, 'PkgStorage: pkg not installed');
        l.installed[pkg][client] = false;
    }

    function installedBy(Layout storage l, address client) internal view returns (address[] memory pkgs) {
        uint n = 0;
        for (uint256 i; i < l.pkgs.length(); i++) {
            (address pkg,) = l.pkgs.at(i);
            if (l.installed[pkg][client]) {
                n++;
            }
        }
        pkgs = new address[](n);
        uint index = 0;
        for (uint256 i; i < l.pkgs.length(); i++) {
            (address pkg,) = l.pkgs.at(i);
            if (l.installed[pkg][client]) {
                pkgs[index] = pkg;
                index++;
            }
        }
    }

    function installersOf(Layout storage l, address pkg, bytes32 baseplateId) internal view returns (address[] memory installers) {
        EnumerableSet.AddressSet storage clients = AccessControlStorage.layout().roles[baseplateId].members;
        
        uint n = 0;
        for (uint256 i; i < clients.length(); i++) {
            address client = clients.at(i);
            if (l.installed[pkg][client]) {
                n++;
            }
        }
        installers = new address[](n);
        uint index = 0;
        for (uint256 i; i < clients.length(); i++) {
            address client = clients.at(i);
            if (l.installed[pkg][client]) {
                installers[index] = client;
                index++;
            }
        }
        
        return installers;
    }

}