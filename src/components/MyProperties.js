import React, { useState } from 'react';
import Modal from './Modal';
import { useRealEstateMarketplace } from '../context/realStateContext';
import Card from './Card';

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
          {userProperties.map((home,idx)=>(
            <Card home={home} key={idx}/>
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