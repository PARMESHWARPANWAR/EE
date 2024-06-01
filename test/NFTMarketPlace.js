const { expect } = require("chai");
const { ethers } = require("hardhat");
 
describe("NFTMarketplaceWithEscrow", function () {
  let NFTMarketplaceWithEscrow, nftContract, owner, seller, buyer, inspector, lender;
  const tokenUrl = "https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png";
  const tokenId = 1;
  const price = ethers.utils.parseEther("1");
  const escrowAmount = ethers.utils.parseEther("0.1");

  beforeEach(async function () {
    [owner, seller, buyer, inspector, lender] = await ethers.getSigners();

    // Deploy Real Estate
    const NFTMock = await ethers.getContractFactory("RealEstate");
    nftContract = await NFTMock.deploy();

    const Marketplace = await ethers.getContractFactory("NFTMarketplaceWithEscrow");
    NFTMarketplaceWithEscrow = await Marketplace.deploy(nftContract.address,seller.address);

    await nftContract.connect(seller).mint(tokenUrl);
  });

  it("Should list an NFT for sale", async function () {
    await nftContract.connect(seller).approve(NFTMarketplaceWithEscrow.address, tokenId);
    await NFTMarketplaceWithEscrow.connect(seller).listNFT(tokenId, price, escrowAmount, true);

    const listing = await NFTMarketplaceWithEscrow.listings(tokenId);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.price).to.equal(price);
    expect(listing.escrowAmount).to.equal(escrowAmount);
    expect(listing.isListed).to.be.equal(true);
    expect(await NFTMarketplaceWithEscrow.isPublic(tokenId)).to.be.equal(true);
  });

  it("Should buy an NFT and update listing", async function () {
    await nftContract.connect(seller).approve(NFTMarketplaceWithEscrow.address, tokenId);
    await NFTMarketplaceWithEscrow.connect(seller).listNFT(tokenId, price, escrowAmount, true);

    await NFTMarketplaceWithEscrow.connect(buyer).buyNFT(tokenId, { value: price.add(escrowAmount) });

    const listing = await NFTMarketplaceWithEscrow.listings(tokenId);
    expect(listing.buyer).to.equal(buyer.address);

    const ownerOfToken = await nftContract.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(NFTMarketplaceWithEscrow.address);
  });

  it("Should finalize sale and transfer NFT to buyer", async function () {
    await nftContract.connect(seller).approve(NFTMarketplaceWithEscrow.address, tokenId);
    await NFTMarketplaceWithEscrow.connect(seller).listNFT(tokenId, price, escrowAmount, true);

    await NFTMarketplaceWithEscrow.connect(buyer).buyNFT(tokenId, { value: price.add(escrowAmount) });
    await NFTMarketplaceWithEscrow.connect(seller).finalizeSale(tokenId);

    const ownerOfToken = await nftContract.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(buyer.address);

    const listing = await NFTMarketplaceWithEscrow.listings(tokenId);
    expect(listing.seller).to.equal(ethers.constants.AddressZero);
    expect(listing.buyer).to.equal(ethers.constants.AddressZero);
    expect(listing.isListed).to.be.equal(false);
    expect(await NFTMarketplaceWithEscrow.isPublic(tokenId)).to.be.equal(false);
  });

  it("Should update listing visibility", async function () {
    await nftContract.connect(seller).approve(NFTMarketplaceWithEscrow.address, tokenId);
    await NFTMarketplaceWithEscrow.connect(seller).listNFT(tokenId, price, escrowAmount, false);

    expect(await NFTMarketplaceWithEscrow.isPublic(tokenId)).to.be.equal(false);

    await NFTMarketplaceWithEscrow.connect(seller).makeListingPublic(tokenId);

    expect(await NFTMarketplaceWithEscrow.isPublic(tokenId)).to.be.equal(true);
  });

  it("Should not allow buying a non-public NFT", async function () {
    await nftContract.connect(seller).approve(NFTMarketplaceWithEscrow.address, tokenId);
    await NFTMarketplaceWithEscrow.connect(seller).listNFT(tokenId, price, escrowAmount, false);

    await expect(NFTMarketplaceWithEscrow.connect(buyer).buyNFT(tokenId, { value: price.add(escrowAmount) }))
      .to.be.revertedWith("NFT is not public");
  });

  it("Should 2 cancel escrow and refund buyer", async function () {
    await nftContract.connect(seller).approve(NFTMarketplaceWithEscrow.address, tokenId);
    await NFTMarketplaceWithEscrow.connect(seller).listNFT(tokenId, price, escrowAmount, true);
    const buyerBalanceBefore = await buyer.getBalance();
    await NFTMarketplaceWithEscrow.connect(buyer).buyNFT(tokenId, { value: price.add(escrowAmount) });
  
    // Cancel escrow and refund buyer
    await NFTMarketplaceWithEscrow.connect(seller).cancelEscrow(tokenId);
    const buyerBalanceAfter = await buyer.getBalance();
    expect(buyerBalanceAfter).to.be.closeTo(buyerBalanceBefore.sub(price), ethers.utils.parseEther("0.001")); // Adjust the tolerance as needed
  });
});


describe("SourceChainSender and DestChainReceiver", function () {
  let SourceChainSender,
    DestChainReceiver,
    RealEstate,
    NFTMarketplaceWithEscrow,
    sourceChainSender,
    destChainReceiver,
    realEstate,
    nftMarketplace,
    owner,
    seller,
    buyer;

  const tokenUrl = "https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png";
  const tokenId = 1;
  const price = ethers.utils.parseEther("1");
  const escrowAmount = ethers.utils.parseEther("0.1");

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy Real Estate
    const RealEstateContract = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstateContract.deploy();

    // Deploy NFT Marketplace
    const NFTMarketplaceContract = await ethers.getContractFactory("NFTMarketplaceWithEscrow");
    nftMarketplace = await NFTMarketplaceContract.deploy(realEstate.address, owner.address);

    // Deploy SourceChainSender
    const SourceChainSenderContract = await ethers.getContractFactory("SourceChainSender");
    sourceChainSender = await SourceChainSenderContract.deploy(realEstate.address, nftMarketplace.address);

    // Deploy DestChainReceiver
    const DestChainReceiverContract = await ethers.getContractFactory("DestChainReceiver");
    destChainReceiver = await DestChainReceiverContract.deploy(nftMarketplace.address);

    // Mint an NFT
    await realEstate.connect(seller).mint(tokenUrl);
    await realEstate.connect(seller).approve(nftMarketplace.address, tokenId);
  });

  it("Should list an NFT on the destination chain", async function () {
    // Simulate sending the listing to the destination chain
    const messageId = await sourceChainSender
      .connect(seller)
      .sendNFTListing(destChainReceiver.address, tokenId, price, escrowAmount, true);

    // Check if the NFT is listed on the destination chain
    const listing = await nftMarketplace.listings(tokenId);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.price).to.equal(price);
    expect(listing.escrowAmount).to.equal(escrowAmount);
    expect(listing.isListed).to.be.equal(true);
    expect(await nftMarketplace.isPublic(tokenId)).to.be.equal(true);
  });

  it("Should not allow listing if not the owner", async function () {
    await expect(
      sourceChainSender
        .connect(buyer)
        .sendNFTListing(destChainReceiver.address, tokenId, price, escrowAmount, true)
    ).to.be.revertedWith("Only contract owner can call this method");
  });

  // Add more test cases as needed
});