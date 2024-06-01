import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import RealEstateABI from '../abis/RealEstate.json';
import WeatherABI from '../abis/Weather.json'
import NFTMarketPlaceABI from '../abis/NFTMarketPlace.json';
import config from '../config.json';
import { extractTemperatureString } from '../utils/functions';


const RealEstateMarketplaceContext = createContext();

export const useRealEstateMarketplace = () => {
  const context = useContext(RealEstateMarketplaceContext);
  if (!context) {
    throw new Error('useRealEstateMarketplace must be used within a RealStateProvider');
  }
  return context;
};

export const RealEstateMarketplaceProvider = ({ children }) => {

  const [userProperties, setUserProperties] = useState([]);
  const [publicProperties, setPublicProperties] = useState([]);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [realEstate, setRealEstate] = useState(null);
  const [weatherContract, setWeatherContract] = useState(null);
  const [network, setNetwork] = useState(null);
  const [account, setAccount] = useState(null);
  const [featching, setFeatching] = useState(false);
  const [connecting, setConnecting] = useState(false)
  const [loadingTemp, setLoadingTemp] = useState(false)
  const [tempOfCities, setTempOfCities] = useState({})

  const connectWallet = async () => {
    setConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
      setConnecting(false)
    } catch (err) {
      console.log(err);
      if (err?.message) { console.log('error message=>', err?.message) } else {
        console.log('Some thing wrong on auth please try again')
      }
      setConnecting(false)
    }
  }

  const loadBlockchainData = async () => {
    setFeatching(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();
      setNetwork(network);

      
      const realEstateContract = new ethers.Contract(
        config[network.chainId].realEstate.address,
        RealEstateABI,
        provider
      );

     
      setRealEstate(realEstateContract);

     
      const escrowContract = new ethers.Contract(
        config[network.chainId].nftContract.address,
        NFTMarketPlaceABI,
        provider
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

        if (isListed && isPublic) {
          homes.push({ ...homeData, isPublic, isListed, seller, buyer });
        }

        if (owner === account || seller === account) {
          ownedProperties.push({ ...homeData, isListed, isPublic, seller, buyer });
        }

      }

      setPublicProperties(homes);
      setUserProperties(ownedProperties);
      setFeatching(false)
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setFeatching(false)
    }
  };

  const getTempOfCities = async () => {
    setLoadingTemp(true)
    try {
      const weatherContract = new ethers.Contract(
        config[network.chainId].weatherContract.address,
        WeatherABI,
        provider // Use the provider directly for read-only operations
      );
      setWeatherContract(weatherContract);
  
      const data = await weatherContract.listAllCities();
  
      const tempOfCitiesData = {};
  
      for (const cityData of data) {
        const { sender, timestamp, name, temperature } = cityData;
        if (temperature) {
          const weather = extractTemperatureString(temperature);
          tempOfCitiesData[name] = weather;
        } else {
          tempOfCitiesData[name] = null;
        }
      }
  
      setTempOfCities(tempOfCitiesData);
      setLoadingTemp(false)
    } catch (err) {
      console.log(err)
      setLoadingTemp(false)
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
    if (provider && network) {
      getTempOfCities()
    }
  }, [provider, network])

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

  const value = { signer, account, userProperties, setAccount, escrow, provider, realEstate, network, publicProperties, featching, connecting, refresh, connectWallet,tempOfCities,setTempOfCities,loadingTemp ,weatherContract};

  return (
    <RealEstateMarketplaceContext.Provider value={value}>
      {children}
    </RealEstateMarketplaceContext.Provider>
  );
};