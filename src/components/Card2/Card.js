import React, { useState } from "react";
import "./Card.css"; // Make sure to create a corresponding CSS file

const Card = ({ home, toggleModal }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleMouseEnter = () => {
        setIsFlipped(true);
    };

    const handleMouseLeave = () => {
        setIsFlipped(false);
    };

    return (
        <div
            className="card-container w-fit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`card ${isFlipped ? "is-flipped" : ""}`}>
                <div className="card-front" style={{ backgroundImage: `url(${home.image})` }}>
                    <div className="absolute top-2 flex justify-between w-full px-4 text-blue-900">
                        <h3
                            style={{
                                textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
                            }}

                        >
                            {home.name}
                        </h3>
                        <span>25°C</span>
                    </div>
                </div>
                <div className="card-back">
                    <div className="text-xs">
                        {/* Content that shows on hover */}
                        <h4>{home.attributes[0].value} ETH {home.id}</h4>
                        <p>
                            <strong>{home.attributes[2].value}</strong> bds |{' '}
                            <strong>{home.attributes[3].value}</strong> ba |{' '}
                            <strong>{home.attributes[4].value}</strong> sqft
                        </p>
                        <p>address:{home.address}</p>
                        <button className="home__buy" >
                            Button  Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
