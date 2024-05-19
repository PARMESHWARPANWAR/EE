import React, { useEffect, useState } from 'react';
import closeIcon from '../assets/close.svg';
import { ethers } from 'ethers';

const BuyModal = ({ home, provider, escrow, toggleModal, account, connectWallet }) => {
    const { id, name, image, attributes, address, description, isPublic } = home;
    const [hasPurchased, setHasPurchased] = useState(false);

    const buyHomeHandler = async () => {
        try {
          if (!account) {
            alert('Please connect your wallet first.');
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
            return;
          }
      
          // Buyer deposit earnest
          //[Todo] provide max gas limit
          //const transaction = await escrow.connect(signer).buyNFT(id, { value: totalRequiredAmount, gasLimit });
          const transaction = await escrow.connect(signer).buyNFT(id, { value: totalRequiredAmount });
          await transaction.wait();
          setHasPurchased(true);
        } catch (error) {
          console.error('Error buying home:', error);
          alert('An error occurred while buying the home. Please try again.');
        }
      };

    const finalizeHandler = () => {
        // Implement finalize logic here
    };

    useEffect(() => {
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
                        {isPublic && !hasPurchased ? (
                            account ? (
                                <button className="home__buy" onClick={buyHomeHandler}>
                                    Buy
                                </button>
                            ) : (
                                <button className="home__buy" onClick={connectWallet}>
                                    Connect Wallet
                                </button>
                            )
                        ) : (
                            <button className="home__buy" onClick={finalizeHandler} disabled={isPublic}>
                                Finalize
                            </button>
                        )}
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