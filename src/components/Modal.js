import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import close from '../assets/close.svg';
import { tokens } from '../utils/token';
import { useRealEstateMarketplace } from '../context/realStateContext';

const Modal = ({ home, provider, toggleModal, escrow, refresh }) => {
  const { account,realEstate } = useRealEstateMarketplace();
  const { id, name, image, address, attributes, description, isListed: currentIsListed, isPublic: currentIsPublic, seller, buyer: actualBuyer } = home;
  const [price, setPrice] = useState(tokens(0.5));
  const [escrowAmount, setEscrowAmount] = useState(tokens(0.2));
  const [finalized, setFinalized] = useState(false);
  const [isListed, setIsListed] = useState(currentIsListed);
  const [isPublic, setIsPublic] = useState(currentIsPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [publicCheck,setPublicCheck] = useState(true)

  const listHandler = async () => {
    setIsLoading(true)
    try {
      const signer = await provider.getSigner();

      //Approve nft transfer
      let transaction = await realEstate.connect(signer).approveForEscrow(id, escrow.address)
      await transaction.wait()

      transaction = await escrow.connect(signer).listNFT(id, price, escrowAmount, publicCheck);
      await transaction.wait();
      console.log('listHandler called transaction complete for ', id);
      setIsListed(true);
      refresh();
      setIsLoading(false)
    } catch (error) {
      console.error('Error listing NFT:', error);
      setIsLoading(false)
    }
  };

  const publicHandler = async () => {
    setIsLoading(true)
    try {
      const signer = await provider.getSigner();
      const transaction = await escrow.connect(signer).makeListingPublic(id);
      await transaction.wait();
      console.log('publicHandler called transaction complete for ', id);
      setIsPublic(true);
      refresh();
      setIsLoading(false)
    } catch (error) {
      console.error('Error making listing public:', error);
      setIsLoading(false)
    }
  };

  const finalizeHandler = async () => {
    setIsLoading(true)
    try {
      const signer = await provider.getSigner();
      const contract = escrow.connect(signer);

      console.log('Finalizing sale for property:', id);
      const transaction = await contract.finalizeSale(id);
      await transaction.wait();

      console.log('Sale finalized successfully');
      setFinalized(true);
      refresh(); // Refresh the data after successful finalization
      setIsLoading(false)
    } catch (error) {
      console.error('Error finalizing sale:', error);
      console.log('error message=>', error.message)
      setIsLoading(false)
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
          <div>{!isLoading ? <>{!isListed ? (
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
          )}</> : <button className="home__buy">
            <span className='flex w-fit mx-auto'>  <svg className="animate-spin h-5 w-5 mr-2 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg> Processing...</span>
          </button>}

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