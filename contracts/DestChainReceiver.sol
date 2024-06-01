// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {NFTMarketplaceWithEscrow} from "./NFTMarketPlace.sol";

contract DestChainReceiver is CCIPReceiver, OwnerIsCreator {
    NFTMarketplaceWithEscrow public nftMarketplace;

    address public routerEthSepolia = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;

    /// @notice Constructor initializes the contract with the router address and the NFT marketplace address.
    constructor(address _nftMarketplace) CCIPReceiver(routerEthSepolia) {
        nftMarketplace = NFTMarketplaceWithEscrow(_nftMarketplace);
    }

    /// @notice handle a received message
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
    {
        (bool success, ) = address(nftMarketplace).call(any2EvmMessage.data);
        require(success, "NFT listing failed");
    }
}