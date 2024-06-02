# Real Estate NFT DApp
https://etherestate.vercel.app/

Subscription Id :
Link : 

## Technology Stack & Tools

- Solidity (Writing Smart Contracts & Tests)
- Javascript (React & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [React.js](https://reactjs.org/) (Frontend Framework)

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/)

## Setting Up
### 1. Clone/Download the Repository

### 2. Install Dependencies:
`$ npm install`

### 3. Run tests
`$ npx hardhat test`

### 4. Start Hardhat node
`$ npx hardhat node`

### 5. Run deployment script
In a separate terminal execute:
`$ npx hardhat run ./scripts/deploy.js --network localhost`

### 7. Start frontend
`$ npm run start`


#### 1. The problem your project addresses:
The real estate industry suffers from a lack of transparency, high transaction costs, slow and inefficient processes, and barriers to entry for many investors. Property records can be difficult to access and verify, there are many intermediaries involved in each transaction, and investing in real estate typically requires large amounts of capital. This project aims to address these issues by using blockchain technology to streamline real estate transactions, increase transparency and liquidity, and open up real estate investment to a wider pool of participants.

#### 2. How you've addressed the problem:
We have developed a decentralized platform using blockchain that tokenizes real estate assets, allowing property ownership to be divided into smaller, more affordable digital tokens. Ownership and transaction records are immutably stored on the blockchain, providing a secure, transparent and auditable trail. Smart contracts automate aspects of property management and transactions like escrow, reducing the need for intermediaries and lowering costs. The tokens are tradable on the platform's marketplace, enabling fractional ownership and greatly increasing liquidity compared to traditional real estate. Overall, the platform makes real estate investment more accessible, affordable and efficient.

#### 2. Technologies used:

- Solidity: Used to write the smart contracts that power the platform's core functionality like property tokenization, transactions, escrow and ownership records.
- Hardhat: An Ethereum development environment used to test, compile, deploy and debug the smart contracts.
- React.js: The platform's user interface is built with the React.js framework to create an intuitive, responsive front-end that integrates with the blockchain back-end. React enables a componentized architecture and fast performance.
- IPFS: The InterPlanetary File System is used to store property records, documents, images and other data in a decentralized manner. IPFS hashes are referenced in the smart contracts to link the on-chain and off-chain data.