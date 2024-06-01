const hre = require("hardhat");

const tokens = (n) => {
  // eslint-disable-next-line no-undef
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  // eslint-disable-next-line no-undef
  const [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Deploy Real Estate
  // eslint-disable-next-line no-undef
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  console.log(`Minting 9 properties...\n`)

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait()
  }

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait()
  }

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploy Escrow
  // eslint-disable-next-line no-undef
  const Escrow = await ethers.getContractFactory('NFTMarketplaceWithEscrow')
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address
  )

  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing 3 properties...\n`)

  for (let i = 0; i < 9; i++) {
    // Approve properties...
    let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }
  console.log(`Finished.`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
