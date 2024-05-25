// Show all public properties that someone selling them
// Properties should be listed and public properties
// isPublic = true
// isListed = true
import React, { useState } from 'react'
import { useRealEstateMarketplace } from '../context/realStateContext';
import BuyModal from './BuyModal';

const MarketPlace = () => {
    const [homes, setHomes] = useState([])
    const { provider, escrow, account, publicProperties,connectWallet } = useRealEstateMarketplace();
    const [home, setHome] = useState({})
    const [toggle, setToggle] = useState(false);

    const toggleModal = (home) => {
        setHome(home)
        toggle ? setToggle(false) : setToggle(true);
    }

    const buy = async (home) => {

    }

    return (
        <div>
            <div>
                <div className='cards__section'>
                    <h1>Public Properties</h1>
                    <hr />
                    <div className='cards'>
                        {publicProperties.map((home, index) => (
                            <div className='card overflow-hidden' key={index} onClick={() => toggleModal(home)}>
                                <div className='card__image'>
                                    <img src={home.image} alt="Home"  />
                                </div>
                                <div className='card__info'>
                                    <h4>{home.attributes[0].value} ETH</h4>
                                    <p>
                                        <strong>{home.attributes[2].value}</strong> bds |
                                        <strong>{home.attributes[3].value}</strong> ba |
                                        <strong>{home.attributes[4].value}</strong> sqft
                                    </p>
                                    <p>{home.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <h1>Owned</h1>
            {toggle && (
                <BuyModal
                    home={home}
                    provider={provider}
                    escrow={escrow}
                    toggleModal={toggleModal}
                    account={account}
                    connectWallet={connectWallet}
                />
            )}
        </div>
    )
}

export default MarketPlace
