import React, { useState } from 'react';
import Modal from './Modal';
import { useRealEstateMarketplace } from '../context/realStateContext';

const MyProperties = () => {
  const { account, provider, escrow, realEstate, userProperties, refresh } = useRealEstateMarketplace();
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = (home) => {
    setSelectedHome(home);
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <div className="cards__section">
        <h3>My Properties</h3>
        <hr />
        <div className="cards">
          {userProperties.map((home, index) => (
            <div className="card" key={index} onClick={() => toggleModal(home)}>
              <div className="card__image">
                <img src={home.image} alt="Home" />
              </div>
              <div className="card__info">
                <h4>{home.attributes[0].value} ETH {home.id}</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |{' '}
                  <strong>{home.attributes[3].value}</strong> ba |{' '}
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && (
        <Modal
          home={selectedHome}
          escrow={escrow}
          toggleModal={toggleModal}
          refresh={refresh}
          provider={provider}
        />
      )}
    </div>
  );
};

export default MyProperties;