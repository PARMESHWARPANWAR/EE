import React from 'react'
import { useRealEstateMarketplace } from '../context/realStateContext';

const ConnectWallet = () => {
  const { account, setAccount, connectWallet,connecting } = useRealEstateMarketplace();
  return (
    <>
      {account ? (
        <button
          type="button"
          className='nav__connect'
        >
          {account.slice(0, 6) + '...' + account.slice(38, 42)}
        </button>
      ) : (
        connecting? <button type="button"
        className='nav__connect'>
        <span className='flex w-fit mx-auto'>  <svg className="animate-spin h-5 w-5 mr-2 mt-0.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> Connecting...</span>
      </button>:
        <button
          type="button"
          className='nav__connect'
          onClick={connectWallet}
        >
          Connect
        </button>
      )}
    </>
  )
}

export default ConnectWallet
