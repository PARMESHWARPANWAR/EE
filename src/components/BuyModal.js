import React, { useEffect, useState } from 'react';
import closeIcon from '../assets/close.svg';
import { ethers } from 'ethers';
import ConnectWallet from './ConnectWallet';

const BuyModal = ({ home, provider, escrow, toggleModal, account }) => {
    const { id, name, image, attributes, address, buyer: currentBuyer, description, isPublic } = home;
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [buyer, setBuyer] = useState('')

    const buyHomeHandler = async () => {
        setIsLoading(true)
        try {
            if (!account) {
                alert('Please connect your wallet first.');
                setIsLoading(false)
                return;
            }

            const signer = await provider.getSigner();
            const balance = await signer.getBalance();
            const balanceInEth = ethers.utils.formatEther(balance);

            const listing = await escrow.listings(id);
            const { price, escrowAmount } = listing;

            // Calculate the total required amount (price + escrow amount)
            const totalRequiredAmount = price.add(escrowAmount);
            const totalRequiredAmountInEth = ethers.utils.formatEther(totalRequiredAmount);

            // Get the estimated gas limit and gas price
            const gasLimit = await escrow.estimateGas.buyNFT(id, { value: totalRequiredAmount });
            const gasPrice = await provider.getGasPrice();

            // Calculate the total gas cost
            const gasCost = gasLimit.mul(gasPrice);
            const gasCostInEth = ethers.utils.formatEther(gasCost);

            // Calculate the total amount required (price + escrow amount + gas cost)
            const totalAmount = totalRequiredAmount.add(gasCost);
            const totalAmountInEth = ethers.utils.formatEther(totalAmount);

            // Check if the user has sufficient balance
            if (balance.lt(totalAmount)) {
                alert(`Insufficient balance to buy the home. Your balance is ${balanceInEth} ETH, but you need ${totalAmountInEth} ETH to cover the price (${totalRequiredAmountInEth} ETH), escrow amount, and gas fees (${gasCostInEth} ETH).`);
                setIsLoading(false)
                return;
            }

            // Buyer deposit earnest
            //[Todo] provide max gas limit
            //const transaction = await escrow.connect(signer).buyNFT(id, { value: totalRequiredAmount, gasLimit });
            const transaction = await escrow.connect(signer).buyNFT(id, { value: totalRequiredAmount });
            await transaction.wait();
            setHasPurchased(true);
            setBuyer(account)
            setIsLoading(false)
        } catch (err) {
            console.error('Error buying home:', err);
            console.log('message==>', err?.message);
            alert('An error occurred while buying the home. Please try again.');
            setIsLoading(false)
        }
    };

    const finalizeHandler = () => {
        // Implement finalize logic here
    };

    useEffect(() => {
        if (currentBuyer) {
            setBuyer(currentBuyer)
        }
        // ownerOfNFT();
    }, []);

    return (
        <div className="home">
            <div className="home__details">
                <div className="home__image">
                    <img src={image} alt="Home" />
                </div>
                <div className="home__overview rounded">
                    <h1>{name}</h1>
                    <p>
                        <strong>{attributes[2].value}</strong> bds |{' '}
                        <strong>{attributes[3].value}</strong> ba |{' '}
                        <strong>{attributes[4].value}</strong> sqft
                    </p>
                    <p>{address}</p>
                    <h2>{attributes[0].value} ETH</h2>
                    <div>
                        {
                            !isLoading ? <>{buyer ? (buyer === account ? <button className="home__buy">
                                Wait
                            </button> : <button className="home__buy">
                                Out Off Stock
                            </button>) : <> {isPublic && !hasPurchased ? (
                                account ? (
                                    <button className="home__buy" onClick={buyHomeHandler}>
                                        Buy
                                    </button>
                                ) : (
                                    <ConnectWallet/>
                                )
                            ) : (
                                <button className="home__buy" onClick={finalizeHandler} disabled={isPublic}>
                                    Finalize
                                </button>
                            )}</>}

                            </> : <button className="home__buy">
                                <span className='flex w-fit mx-auto'>  <svg className="animate-spin h-5 w-5 mr-2 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg> Processing...</span>
                            </button>
                        }
                        <button className="home__contact">Contact agent</button>
                    </div>
                    <hr />
                    <h2>Overview</h2>
                    <p>{description}</p>
                    <hr />
                    <h2>Facts and features</h2>
                    <ul>
                        {attributes.map((attribute, index) => (
                            <li key={index}>
                                <strong>{attribute.trait_type}</strong> : {attribute.value}
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={toggleModal} className="home__close">
                    <img src={closeIcon} alt="Close" />
                </button>
            </div>
        </div>
    );
};

export default BuyModal;