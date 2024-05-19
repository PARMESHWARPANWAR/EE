import { useState } from "react";
import Modal from "../Modal";
import { useRealEstateMarketplace } from "../../context/realStateContext";
import Card from "../Card2/Card";

function MyProperties() {
  const { account, provider, escrow, realEstate, userProperties, refresh } = useRealEstateMarketplace();
  const [selectedHome, setSelectedHome] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = (home) => {
    setSelectedHome(home);
    setIsModalOpen(!isModalOpen);
  };

    return (
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-4">My Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userProperties.map((home, index) => (
           <Card key={index} home={home} toggleModal={toggleModal}/>
          ))}
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
}

export default MyProperties;