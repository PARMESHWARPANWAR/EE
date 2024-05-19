import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import RealEstateABI from '../abis/RealEstate.json';
import NFTMarketPlaceABI from '../abis/NFTMarketPlace.json';
import config from '../config.json';


// Create the context
const RealEstateMarketplaceContext = createContext();

// Custom hook to access the context
export const useRealEstateMarketplace = () => {
  const context = useContext(RealEstateMarketplaceContext);
  if (!context) {
    throw new Error('useRealEstateMarketplace must be used within a RealStateProvider');
  }
  return context;
};

// Create a provider component
export const RealEstateMarketplaceProvider = ({ children }) => {

  const [userProperties, setUserProperties] = useState([]);
  const [publicProperties, setPublicProperties] = useState([]);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [realEstate, setRealEstate] = useState(null);
  const [network, setNetwork] = useState(null);
  const [account, setAccount] = useState(null);

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account);
}

  const loadBlockchainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();
      setNetwork(network);

      const realEstateContract = new ethers.Contract(
        config[network.chainId].realEstate.address,
        RealEstateABI,
        provider // Use the provider directly for read-only operations
      );
      setRealEstate(realEstateContract);

      const escrowContract = new ethers.Contract(
        config[network.chainId].nftContract.address,
        NFTMarketPlaceABI,
        provider // Use the provider directly for read-only operations
      );
      setEscrow(escrowContract);

      const totalSupply = await realEstateContract.totalSupply();
      const homes = [];
      const ownedProperties = [];

      for (let i = 1; i <= totalSupply; i++) {
        const uri = await realEstateContract.tokenURI(i);
        const metadata = await fetchMetadata(uri);
        const listing = await escrowContract.listings(i);
        const isPublic = await escrowContract.isPublic(i);
        const owner = await realEstateContract.ownerOf(i);
        const { isListed, seller } = listing;

        const homeData = { ...metadata, id: i };
        const buyer = listing.buyer === ethers.constants.AddressZero ? null : listing.buyer

        console.log('here is data', i, homeData, isListed, isPublic, seller, buyer, owner)
        
        if (isListed && isPublic) {
          homes.push({ ...homeData, isPublic, isListed, seller, buyer });
        }

        if (owner === account || seller === account) {
          ownedProperties.push({ ...homeData, isListed, isPublic, seller, buyer });
        }

      }

      setPublicProperties(homes);
      setUserProperties(ownedProperties);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  };

  const fetchMetadata = async (uri) => {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, [account]);

  useEffect(() => {
    const handleAccountsChanged = async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const refresh = () => {
    loadBlockchainData();
  };

  const value = { signer, account, userProperties, setAccount, escrow, provider, realEstate, network, publicProperties, refresh ,connectHandler};

  return (
    <RealEstateMarketplaceContext.Provider value={value}>
      {children}
    </RealEstateMarketplaceContext.Provider>
  );
};