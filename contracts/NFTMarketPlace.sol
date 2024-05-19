// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplaceWithEscrow {

// ===================================== PUBLIC =================================   
    IERC721 public nftContract;
    address public inspector;
    address public lender;

// ===================================== PRIVATE =================================
    address private owner;

// ===================================== MAPPING =================================
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => bool)) public approvals;
    mapping(uint256 => bool) public isPublic;

// ===================================== STRUCTS =================================
    struct Listing {
        address payable seller;
        address payable buyer;
        uint256 price;
        uint256 escrowAmount;
        bool isListed;
    }

// ===================================== EVENTS =================================
    event ListingCreated(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 escrowAmount);
    event ListingRemoved(uint256 indexed tokenId, address indexed seller);
    event ListingSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event EscrowDeposited(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event ListingMadePublic(uint256 indexed tokenId);


    constructor(address _nftContract , address _owner) {
        nftContract = IERC721(_nftContract);
        owner = _owner;
    }

// ===================================== EXTERNAL =================================    
    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    function setInspector(address _inspector) external onlyOwner(){
        inspector=_inspector;
    }
    
    function setLender(address _lender) external onlyOwner{
        lender = _lender;
    }

    function listNFT(uint256 tokenId, uint256 price, uint256 escrowAmount, bool _isPublic) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(!listings[tokenId].isListed, "NFT is already listed");
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = Listing(payable(msg.sender), payable(address(0)), price, escrowAmount, true);
        isPublic[tokenId] = _isPublic;
        emit ListingCreated(tokenId, msg.sender, price, escrowAmount);
    }

    function buyNFT(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "NFT is not listed");
        require(isPublic[tokenId], "NFT is not public");
        require(msg.value >= listing.price, "Insufficient funds");
        require(msg.value >= listing.escrowAmount, "Escrow amount not deposited");

        listing.buyer = payable(msg.sender);
        listings[tokenId] = listing;

        emit ListingSold(tokenId, msg.sender, msg.value);
    }

    function finalizeSale(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "NFT is not listed");
        require(msg.sender == listing.seller, "Only seller can finalize the sale");

        nftContract.transferFrom(address(this), listing.buyer, tokenId);
        listing.seller.transfer(listing.price);
        if (listing.escrowAmount > 0) {
            listing.buyer.transfer(listing.escrowAmount);
        }

        delete listings[tokenId];
        isPublic[tokenId] = false;
    }

    function removeNFTListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "NFT is not listed");
        require(listing.seller == msg.sender, "You are not the seller");
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        delete listings[tokenId];
        emit ListingRemoved(tokenId, msg.sender);
    }

    function approveNFTListing(uint256 tokenId) external {
        listings[tokenId].buyer = payable(msg.sender);
        approvals[tokenId][msg.sender] = true;
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        return address(listings[tokenId].buyer);
    }

    function cancelEscrow(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "NFT is not listed");
        require(listing.seller == msg.sender || listing.buyer == msg.sender, "You are not the seller or buyer");
        if (listing.buyer != address(0)) {
            listing.buyer.transfer(listing.escrowAmount);
        }
        delete listings[tokenId];
    }

    function makeListingPublic(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "NFT is not listed");
        require(listing.seller == msg.sender, "You are not the seller");
        isPublic[tokenId] = true;
        emit ListingMadePublic(tokenId);
    }
    
// ===================================== MODIFIER =================================    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this method");
        _;
    }
}