const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender
    let realEstate, escrow

    beforeEach(async () => {
        // Setup accounts
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        // Deploy Real Estate
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // Mint 
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        // Deploy Escrow
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        // Approve Property
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List Property
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        it('Returns seller', async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it('Returns inspector', async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        it('Returns lender', async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })
    })

    describe('Listing', () => {
        it('Updates as listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })

        it('Returns buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it('Returns purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
    })

    describe('Deposits', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Updates contract balance', async () => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Inspection', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()
        })

        it('Updates inspection status', async () => {
            const result = await escrow.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })

    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

    describe('Sale', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })

        it('Updates balance', async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })
    })
})


// ====================================  NEW CONTRACT TESTES =================================================================
// const { expect } = require('chai');
// const { ethers } = require('hardhat');

// const tokens = (n) => {
//     return ethers.utils.parseUnits(n.toString(), 'ether')
// }

// describe('Escrow', () => {
//     let buyer,seller,inspector,lender,randomPerson
//     let realEstate,escrow
    
//     beforeEach(async ()=>{
//         [buyer, seller,inspector,lender,randomPerson] = await ethers.getSigners();

//         // Deploy Real Estate
//         const RealEstate = await ethers.getContractFactory('RealEstate')
//         realEstate = await RealEstate.deploy()

//         // Mint
//         let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png")
//         await transaction.wait()

//         const Escrow = await ethers.getContractFactory('Escrow')
//         escrow = await Escrow.deploy(
//             realEstate.address,
//             seller.address,
//             inspector.address,
//             lender.address
//         )

//         //Approve property
//         transaction = await realEstate.connect(seller).approve(escrow.address,1)
//         await transaction.wait()

//         // List property
//         // transaction = await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5))
//         // await transaction.wait()
//     })

//     describe('Deployment', ()=>{
//         it('Returns NFT address', async ()=>{
//             const result = await escrow.nftAddress()
//             expect(result).to.be.equal(realEstate.address);
//         })
    
//         it("Returns seller", async ()=>{
//             const result = await escrow.seller();
//             expect(result).to.be.equal(seller.address);
//         })
    
//         it("Returns inspector", async ()=>{
//             const result = await escrow.inspector();
//             expect(result).to.be.equal(inspector.address);
//         })
    
//         it("Returns lender", async ()=>{
//             const result = await escrow.lender();
//             expect(result).to.be.equal(lender.address);
//         })
//     })

//     describe('Listing', ()=>{
//         it('Updates as listed',async ()=>{
//             const result = await escrow.isListed(1)
//             expect(result).to.be.equal(true)
//         })

//         it('Updates ownership', async ()=>{
//             expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
//         })

//         it('Returns buyer',async ()=>{
//             const result = await escrow.buyer(1)
//             expect(result).to.be.equal(buyer.address)
//         })

//         it('Returns purchase price',async ()=>{
//             const result = await escrow.purchasePrice(1)
//             expect(result).to.be.equal(tokens(10))
//         })

//         it('Returns escrow amount',async ()=>{
//             const result = await escrow.escrowAmount(1)
//             expect(result).to.be.equal(tokens(5))
//         })
    
//     })

//     describe("Deposits",()=>{
//         it('Updates contract balance', async () =>{
//             const transaction = await escrow.connect(buyer).depositEarnest(1,{value:tokens(5)})
//             await transaction.wait()
//             const result = await escrow.getBalance()
//             expect(result).to.be.equal(tokens(5))
//         })
//     })

//     describe("Inspection", ()=>{
//         it('Updates inspection status', async ()=>{
//             const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
//             await transaction.wait()
//             const result = await escrow.inspectionPassed(1)
//         })
//     })

//     describe('Approval',()=>{
//         it('Updates approval status',async()=>{
//             let transaction = await escrow.connect(buyer).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(seller).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(lender).approveSale(1)
//             await transaction.wait()

//             expect(await escrow.approval(1,buyer.address)).to.be.equal(true);
//             expect(await escrow.approval(1,seller.address)).to.be.equal(true);
//             expect(await escrow.approval(1,lender.address)).to.be.equal(true);
//         })
//     })

//     describe('Sale', async ()=>{
//         beforeEach(async ()=>{
//             let transaction = await escrow.connect(buyer).depositEarnest(1,{value:tokens(5)});
//             await transaction.wait();

//             transaction = await escrow.connect(inspector).updateInspectionStatus(1,true);
//             await transaction.wait()

//             transaction = await escrow.connect(buyer).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(seller).approveSale(1)
//             await transaction.wait()

//             transaction = await escrow.connect(lender).approveSale(1)
//             await transaction.wait()

//             await lender.sendTransaction({ to: escrow.address, value: tokens(5) });

//             transaction = await escrow.connect(seller).finalizeSale(1)
//             await transaction.wait()
//         })

//         it('Updates ownership', async ()=>{
//             expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address);
//         })

//         it('Updates balance', async ()=>{
//             expect(await escrow.getBalance()).to.be.equal(0)
//         })
//     })

//     describe("Cancellation",()=>{

//         // Test case: Buyer cancels order and refunds deposit
//         it('Allows buyer to cancel and refunds deposit',async()=>{
//             let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
    
//             let transaction = await escrow.connect(buyer).cancelOrder(1);
//             await transaction.wait();
    
//             let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
//             let contractBalance = await escrow.getBalance();
    
//             expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
//             expect(contractBalance).to.be.equal(0);
//         });
    
//         // Test case: Seller cancels order and refunds deposit
//         it('Allows seller to cancel and refunds deposit',async()=>{
//             let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
    
//             let transaction = await escrow.connect(seller).cancelOrder(1);
//             await transaction.wait();
    
//             let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
//             let contractBalance = await escrow.getBalance();
    
//             expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
//             expect(contractBalance).to.be.equal(0);
//         });
    
//         // Test case: Inspector cancels order and refunds deposit
//         it('Allows inspector to cancel and refunds deposit',async()=>{
//             let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
    
//             let transaction = await escrow.connect(inspector).cancelOrder(1);
//             await transaction.wait();
    
//             let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
//             let contractBalance = await escrow.getBalance();
    
//             expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
//             expect(contractBalance).to.be.equal(0);
//         });
    
//         // Test case: Lender cancels order and refunds deposit
//         it('Allows lender to cancel and refunds deposit',async()=>{
//             let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
    
//             let transaction = await escrow.connect(lender).cancelOrder(1);
//             await transaction.wait();
    
//             let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
//             let contractBalance = await escrow.getBalance();
    
//             expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
//             expect(contractBalance).to.be.equal(0);
//         });
    
//         // Test case: Unauthorized party tries to cancel order
//         it('Does not allow unauthorized party to cancel order',async()=>{
//             await expect(escrow.connect(randomPerson).cancelOrder(1)).to.be.revertedWith("Unauthorized canceler");
//         });
    
//         // Test case: Cancelling an already canceled order
//         it('Does not allow cancellation of already canceled order',async()=>{
//             await escrow.connect(buyer).cancelOrder(1);
//             await expect(escrow.connect(buyer).cancelOrder(1)).to.be.revertedWith("Order already canceled");
//         });
    
//         // Test case: Cancelling an already finalized order
//         it('Does not allow cancellation of already finalized order',async()=>{
//             await escrow.connect(buyer).approveSale(1);
//             await escrow.connect(seller).approveSale(1);
//             await escrow.connect(lender).approveSale(1);
//             await lender.sendTransaction({ to: escrow.address, value: tokens(5) });
//             await escrow.connect(seller).finalizeSale(1);
    
//             await expect(escrow.connect(buyer).cancelOrder(1)).to.be.revertedWith("Order already finalized");
//         });
    
//         // Add more test cases as needed for edge cases and scenarios
//     });

// })


// //================================================ CURRENT TASK ================================================
// // Check above functionality 
// // Implement cancle option if order exit on given property
// // Show currect pending other order on property

// // OR don't show property which is in currety ordered list

// // Show only buyer so he or she can cancle order

// // Show user or buyer current order propety

// // Implement buyer or any user who own any peroperty can list ther property to site to other can buy property

// // make other page where only seller can see non listed property and also can list 

// // also can so seller , inspector and lender according to property state to approve orders on there prospective 
// // Page 

// //================================================ EXTRA POINT ================================================
// // add other feacture using chailling
// // for example use chain link function to show wheater of according to property city
// // 

// //================================================ END TASK ================================================

// // describe("Cancellation",()=>{
// //     it('Allows buyer to cancel and refunds deposit',async()=>{
// //         let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

// //         let transaction = await escrow.connect(buyer).cancelOrder(1);
// //         await transaction.wait();

// //         let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
// //         let contractBalance = await escrow.getBalance();

// //         expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
// //         expect(contractBalance).to.be.equal(0);
// //     });

// //     it('Allows seller to cancel and refunds deposit',async()=>{
// //         let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

// //         let transaction = await escrow.connect(seller).cancelOrder(1);
// //         await transaction.wait();

// //         let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
// //         let contractBalance = await escrow.getBalance();

// //         expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
// //         expect(contractBalance).to.be.equal(0);
// //     });

// //     it('Allows inspector to cancel and refunds deposit',async()=>{
// //         let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

// //         let transaction = await escrow.connect(inspector).cancelOrder(1);
// //         await transaction.wait();

// //         let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
// //         let contractBalance = await escrow.getBalance();

// //         expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
// //         expect(contractBalance).to.be.equal(0);
// //     });

// //     it('Allows lender to cancel and refunds deposit',async()=>{
// //         let buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

// //         let transaction = await escrow.connect(lender).cancelOrder(1);
// //         await transaction.wait();

// //         let buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
// //         let contractBalance = await escrow.getBalance();

// //         expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.be.equal(tokens(5));
// //         expect(contractBalance).to.be.equal(0);
// //     });
// // });


// //================================================ EXTRA POINT FOR TESTES ================================================


// // Yes, there are several additional tests you can consider to 
// // further enhance the test coverage and ensure the robustness 
// // of your contract:

// // Repeating the same tests with different initial conditions:
// // You can repeat some of the tests with different initial conditions, 
// // such as listing different NFTs, setting different purchase prices and 
// // escrow amounts, and involving different parties (e.g., using different 
// // addresses for buyer, seller, inspector, and lender).
// // Edge cases for depositing funds: Test scenarios where the deposited amount is 
// // equal to or less than the escrow amount, or where the deposited amount exceeds
// //  the escrow amount.
// // Multiple concurrent transactions: Test the contract's behavior when multiple 
// // are happening concurrently, such as depositing funds, approving sales, canceling 
// // orders, and finalizing sales.
// // Handling large values: Test the contract's behavior when dealing with large values 
// // for purchase prices, escrow amounts, and deposited funds.
// // Error cases: Test scenarios where transactions should fail, such as trying
// // to finalize a sale without inspection approval, trying to approve a sale
// // multiple times, or trying to deposit funds after the sale has been finalized.
// // Gas consumption: Measure the gas consumption of each transaction and ensure it 
// // stays within reasonable limits.
// // Fallback function: Test the fallback function to ensure it behaves as expected 
// // when the contract receives ether without a specific function call.
// // Testing event emissions: Ensure that the appropriate events are emitted during
// // each transaction and check the emitted event data.
// // Testing contract upgrades: If you plan to upgrade the contract in the future,
// // consider writing tests to ensure that the upgraded contract behaves correctly 
// // and maintains compatibility with existing functionalities.
// // By incorporating these additional tests, you can thoroughly validate the contract's 
// // functionality, handle various edge cases, and enhance the overall reliability of your 
// // smart contract system.




// //================================================ WEATHER DATA USING CHAIN LINK ================================================
// // get weather data using chain like functions hook


// // const openWeatherRequest = Functions.makeHttpRequest({
// //      url: `http://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${secrets.openWeatherApiKey}&units=imperial`,
// //    })

// // const worldWeatherRequest = Functions.makeHttpRequest({
// //      url: `http://api.worldweatheronline.com/premium/v1/weather.ashx?key=${secrets.worldWeatherApiKey}&q=${cityName}&format=json`,
// //    })
   
// //    const ambeeDataRequest = Functions.makeHttpRequest({
// //      url: `http://api.ambeedata.com/weather/latest/by-lat-lng?lat=${cityLat}&lng=${cityLon}`,
// //      headers: { "x-api-key": `${secrets.ambeeWeatherApiKey}` }
// //    })