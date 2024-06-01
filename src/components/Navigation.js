import { ethers } from 'ethers';
import logo from '../assets/etherEstate.svg';
import { useRealEstateMarketplace } from '../context/realStateContext';
import { Link } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';

// On listing and buying update data again, 
// Not getting account on setAccount 

const Navigation = () => {
    return (
        <nav className='border-b-2'>
            <div className='nav__brand'>
                <Link to="/">
                    <img src={logo} alt="Logo" className='size-20' />
                </Link>
                {/* <h1>Ether Estate</h1> */}
            </div>
            <ul className='nav__links'>
                <li>
                    <Link
                        to="/"
                    // className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        to="/user/properties"
                    // className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                    >
                        Owned
                    </Link>
                </li>
                {/* <li>
                    <Link
                        to="/user/publish-property"
                    // className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                    >
                        Publish Property
                    </Link>
                </li>
                <li>
                    <Link
                        to="/user/approval-requests"
                    // className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                    >
                        Approvals
                    </Link>
                </li>
                <li>
                    <Link
                        to="/user/waiting-approval"
                    // className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md"
                    >
                        Pending
                    </Link>
                </li> */}
            </ul>
            <ConnectWallet/>
        </nav>
    );
}

export default Navigation;