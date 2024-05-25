import React from 'react'

const Card = ({home,toggleModal}) => {
  return (
    <div className="card overflow-hidden"  onClick={() => toggleModal(home)}>
    <div className="card__image">
      <img src={home.image} alt="Home" />
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
  )
}

export default Card
