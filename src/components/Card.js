import React, { useEffect } from 'react'
import { useRealEstateMarketplace } from '../context/realStateContext';
import SmallSpinner from './smallSpinner';

const Card = ({ home, toggleModal }) => {
  const { tempOfCities, getTempOfCity, loadingTemp } = useRealEstateMarketplace();
  const cityTemp = tempOfCities[home?.city] || null;

  return (
    <div className="card overflow-hidden" onClick={() => toggleModal(home)}>
      <div className="card__image">
        <img src={home.image} alt="Home" />
        {loadingTemp && <button className="absolute top-2 right-2 bg-blue-900/70 text-white px-3 py-1 rounded-md text-sm">
          <SmallSpinner />
        </button>}
        {!loadingTemp && cityTemp && (
          <div className="absolute top-2 right-2 bg-blue-900/70 text-white px-3 py-1 rounded-md text-sm">
            <span>{cityTemp}</span>
          </div>
        )}
        {!loadingTemp && !cityTemp && (
          <button className="absolute top-2 right-2 bg-blue-900/70 text-white px-3 py-1 rounded-md text-sm" onClick={(e) => {
            e.stopPropagation();
            getTempOfCity(home.city);
          }}>
            Get Temperature
          </button>
        )}
      </div>
      <div className="card__info">
        <h4>{home.attributes[0].value} ETH {home.id}</h4>
        <p>
          <strong>{home.attributes[2].value}</strong> bds |{' '}
          <strong>{home.attributes[3].value}</strong> ba |{' '}
          <strong>{home.attributes[4].value}</strong> sqft
        </p>
        <p>{home.address}</p>
      </div>
    </div>
  );
};

export default Card
