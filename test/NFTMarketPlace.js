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