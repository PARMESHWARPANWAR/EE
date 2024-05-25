// Show all public properties that someone selling them
// Properties should be listed and public properties
// isPublic = true
// isListed = true
import React, { useState } from 'react'
import { useRealEstateMarketplace } from '../context/realStateContext';
import BuyModal from './BuyModal';
import Card from './Card';

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
                        {publicProperties.map((home, idx) => (
                           <Card home={home} key={idx}/>
                        ))}
                    </div>
                </div>
            </div>
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
