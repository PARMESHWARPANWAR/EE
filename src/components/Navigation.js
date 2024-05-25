import { ethers } from 'ethers';
import logo from '../assets/logo2.png';
import { useRealEstateMarketplace } from '../context/realStateContext';
import { Link } from 'react-router-dom';

// On listing and buying update data again, 
// Not getting account on setAccount 

const Navigation = () => {
    const { account, setAccount,connectWallet } = useRealEstateMarketplace();

    return (
        <nav>
            <div className='nav__brand'>
                <Link to="/">
                    <img src={logo} alt="Logo" />
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
                        My Properties
                    </Link>
                </li>
                <li>
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
                </li>
            </ul>

            {account ? (
                <button
                    type="button"
                    className='nav__connect'
                >
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectWallet}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;