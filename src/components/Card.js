import React, { useEffect, useState } from 'react'
import { useRealEstateMarketplace } from '../context/realStateContext';
import SmallSpinner from './smallSpinner';
import { extractTemperatureString } from '../utils/functions';

const Card = ({ home, toggleModal }) => {
  const { tempOfCities, loadingTemp ,setTempOfCities,weatherContract,provider} = useRealEstateMarketplace();
  const cityTemp = tempOfCities[home?.city] || null;
  const [loading,setLoading] = useState(false)
  const observeTemperature = (city) => {
    setLoading(true)
    const intervalId = setInterval(async () => {
      try {
        let cityData = await weatherContract.getCity(city);
        if (cityData.temperature) {
          const weather = extractTemperatureString(cityData?.temperature);

          setTempOfCities((prevCities) => {
            return {
              ...prevCities,
              [city]: weather
            };
          });

          setLoading(false)
          clearInterval(intervalId);
        }
      } catch (error) {
        setLoading(false)
        console.error(`Error fetching temperature: ${error}`);
      }
    }, 1000);
  };

  const getTempOfCity = async (city) => {
    setLoading(true)
    try{
      const signer = await provider.getSigner()
      //Temperatue
      let transaction = await weatherContract.connect(signer).getTemperature(city)
      await transaction.wait()
      
      observeTemperature(city)
    }catch{
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden" onClick={() => toggleModal(home)}>
      <div className="card__image">
        <img src={home.image} alt="Home" />
        {(loading || loadingTemp) && <button className="absolute top-2 right-2 bg-blue-900/70 text-white px-3 py-1 rounded-md text-sm">
          <SmallSpinner />
        </button>}
        {!loading && !loadingTemp && cityTemp && (
          <div className="absolute top-2 right-2 bg-blue-900/70 text-white px-3 py-1 rounded-md text-sm">
            <span>{cityTemp}</span>
          </div>
        )}
        {!loading && !loadingTemp && !cityTemp && (
          <button className="absolute top-2 right-2 bg-blue-900/70 text-white px-3 py-1 rounded-md text-sm" onClick={(e) => {
            e.stopPropagation();
            getTempOfCity(home.city);
          }}>
            Get Temperature
          </button>
        )}
      </div>
      <div className="card__info">
        <h4>{home.attributes[0].value} ETH </h4>
        <p>
          <strong>{home.attributes[2].value}</strong> bds |{' '}
          <strong>{home.attributes[3].value}</strong> ba |{' '}
          <strong>{home.attributes[4].value}</strong> sqft
        </p>
        <p>{home.city}</p>
        <p>{home.address}</p>
      </div>
    </div>
  );
};

export default Card
