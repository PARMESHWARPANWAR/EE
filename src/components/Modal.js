import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import close from '../assets/close.svg';
import { tokens } from '../utils/token';
import { useRealEstateMarketplace } from '../context/realStateContext';

const Modal = ({ home,provider, toggleModal,escrow, refresh }) => {
  const {  account } = useRealEstateMarketplace();
  const { id, name, image,address, attributes, description, isListed:currentIsListed, isPublic:currentIsPublic, seller, buyer: actualBuyer } = home;
  const [price, setPrice] = useState(tokens(0.5));
  const [escrowAmount, setEscrowAmount] = useState(tokens(0.2));
  const [finalized, setFinalized] = useState(false);
  const [isListed,setIsListed] = useState(currentIsListed);
  const [isPublic,setIsPublic] = useState(currentIsPublic);

  const listHandler = async () => {
    //[Todo: add listing loading state here]
    try {
      const signer = await provider.getSigner();
      const transaction = await escrow.connect(signer).listNFT(id, price, escrowAmount, false);
      await transaction.wait();
      console.log('listHandler called transaction complete for ', id);
      setIsListed(true);
      refresh();
    } catch (error) {
      console.error('Error listing NFT:', error);
    }
  };

  const publicHandler = async () => {
    //[Todo: add publiching loading state here]
    try {
      const signer = await provider.getSigner();
      const transaction = await escrow.connect(signer).makeListingPublic(id);
      await transaction.wait();
      console.log('publicHandler called transaction complete for ', id);
      setIsPublic(true);
      refresh();
    } catch (error) {
      console.error('Error making listing public:', error);
    }
  };

  const finalizeHandler = async () => {
    //[Todo: add finalizing loading state here]
    try {
      const signer = await provider.getSigner();
      const contract = escrow.connect(signer);

      console.log('Finalizing sale for property:', id);
      const transaction = await contract.finalizeSale(id);
      await transaction.wait();

      console.log('Sale finalized successfully');
      setFinalized(true);
      refresh(); // Refresh the data after successful finalization
    } catch (error) {
      console.error('Error finalizing sale:', error);
    }
  };

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={image} alt="Home" />
        </div>
        <div className="home__overview rounded">
          <h1>{name}</h1>
          <p>
            <strong>{attributes[2].value}</strong> bds |
            <strong>{attributes[3].value}</strong> ba |
            <strong>{attributes[4].value}</strong> sqft
          </p>
          <p>{address}</p>

          <h2>{attributes[0].value} ETH</h2>
          <div>
            {!isListed ? (
              <button className="home__buy" onClick={listHandler} disabled={isListed}>
                List
              </button>
            ) : !isPublic ? (
              <button className="home__buy" onClick={publicHandler} disabled={isPublic}>
                Public
              </button>
            ) : seller === account && actualBuyer !== null && !finalized ? (
              <button className="home__buy" onClick={finalizeHandler} disabled={finalized}>
                Finalize
              </button>
            ) : (
              <button className="home__buy" disabled>
                Waiting for Order
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
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Modal;