// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {NFTMarketplaceWithEscrow} from "./NFTMarketPlace.sol";

contract SourceChainSender is OwnerIsCreator {
    using SafeERC20 for IERC20;

    address public routerAvaFuji = 0xF694E193200268f9a4868e4Aa017A0118C9a8177;
    IERC20 public s_linkToken = IERC20(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846);
    uint64 public sepoliaChainSelector = 16015286601757825753;
    IERC721 public nftContract;
    NFTMarketplaceWithEscrow public nftMarketplace;

    // Custom errors to provide more descriptive revert messages.
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error NothingToWithdraw();
    error FailedToWithdrawEth(address owner, address target, uint256 value);

    constructor(address _nftContract, address _nftMarketplace) {
        nftContract = IERC721(_nftContract);
        nftMarketplace = NFTMarketplaceWithEscrow(_nftMarketplace);
    }

    /// @notice Sends data and transfer tokens to receiver on the destination chain.
    /// @notice Pay for fees in LINK.
    /// @dev Assumes your contract has sufficient LINK to pay for CCIP fees.
    /// @param _receiver The address of the recipient on the destination blockchain.
    /// @param _tokenId The ID of the NFT to be listed on the destination chain.
    /// @param _price The price of the NFT listing.
    /// @param _escrowAmount The amount of Ether to be held in escrow.
    /// @param _isPublic Whether the NFT listing should be public or private.
    /// @return messageId The ID of the CCIP message that was sent.
    function sendNFTListing(
        address _receiver,
        uint256 _tokenId,
        uint256 _price,
        uint256 _escrowAmount,
        bool _isPublic
    ) external onlyOwner returns (bytes32 messageId) {
        bytes memory functionCall = abi.encodeWithSignature(
            "listNFT(uint256,uint256,uint256,bool)",
            _tokenId,
            _price,
            _escrowAmount,
            _isPublic
        );
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](0);

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: functionCall,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            feeToken: address(s_linkToken)
        });

        IRouterClient router = IRouterClient(routerAvaFuji);

        uint256 fees = router.getFee(sepoliaChainSelector, evm2AnyMessage);
        if (fees > s_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

        s_linkToken.approve(address(router), fees);

        messageId = router.ccipSend(sepoliaChainSelector, evm2AnyMessage);

        nftContract.transferFrom(msg.sender, address(this), _tokenId);

        return messageId;
    }

    receive() external payable {}

    function withdraw(address _beneficiary) public onlyOwner {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        (bool sent, ) = _beneficiary.call{value: amount}("");
        if (!sent) revert FailedToWithdrawEth(msg.sender, _beneficiary, amount);
    }

    function withdrawToken(
        address _beneficiary,
        address _token
    ) public onlyOwner {
        uint256 amount = IERC20(_token).balanceOf(address(this));
        if (amount == 0) revert NothingToWithdraw();
        IERC20(_token).safeTransfer(_beneficiary, amount);
    }
}