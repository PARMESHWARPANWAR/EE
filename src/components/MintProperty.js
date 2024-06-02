import React, { useState } from 'react';
import { toast } from 'sonner'
import ConnectWallet from './ConnectWallet';
import { useRealEstateMarketplace } from '../context/realStateContext';
import SmallSpinner from './smallSpinner';

const urlsList = [
    "https://ipfs.io/ipfs/QmSf4rvQKRuyrJk2GQAoLBLs3tEf7R8vhugCuCXn9LotSf/metadata.json",
    "https://ipfs.io/ipfs/QmSh749L7YpFgiEaXxvmbjBq3uxiNZT7a7NFTEi1qNknYa/metadata.json",
    "https://ipfs.io/ipfs/QmXwNJkDzmUjRVr5agJQuMsXuCiKuhnwkZEhupZt81JWLu/metadata.json",
    "https://ipfs.io/ipfs/QmPB2Yyp4MiJ6Pemswp4mPGkoAmFeNzawagJiBwxNT7o8s/metadata.json",
    "https://ipfs.io/ipfs/QmZCpnCq1GKGcF4kdojMmyLLb3eHT1tw6pu1KpqueM33Xu/metadata.json",
    "https://ipfs.io/ipfs/Qmev37YunoBdGEpyoG9bEGacyRfUCYDsChWUgCWEPoPS9H/metadata.json",
    "https://ipfs.io/ipfs/QmdL78KZaLmHjYW5Aw25SnFqJPWwsVWtN38Nxo7MHzJvU3/metadata.json",
    "https://ipfs.io/ipfs/QmNdGPeStjmpA1cChGT131gHbfZt3UFLVtsCg9yVoW9u2D/metadata.json",
    "https://ipfs.io/ipfs/Qma1Uo6qnRY1Q4a423Hp8TaWc1ovP2CJMSEESoUhnJmQmk/metadata.json"
]

const MintProperty = () => {
    const { account, realEstate, provider } = useRealEstateMarketplace();
    const [url, setUrl] = useState('');
    const [nftData, setNftData] = useState(null);
    const [loadingMint, setLoadingMint] = useState(false)

    const fetchNFTData = async () => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (validateNFTData(data)) {
                setNftData(data);
            } else {
                toast.error('Invalid NFT data format. Please provide data in the specified format.');
            }
        } catch (error) {
            console.error('Error fetching NFT data:', error);
            toast.error('Error fetching NFT data. Please check the URL and try again.');
        }
    };

    const validateNFTData = (data) => {
        // Implement validation logic to ensure the data is in the required format
        // Return true if the data is valid, false otherwise
        // Example validation:
        return (
            data.hasOwnProperty('name') &&
            data.hasOwnProperty('address') &&
            data.hasOwnProperty('city') &&
            data.hasOwnProperty('country') &&
            data.hasOwnProperty('description') &&
            data.hasOwnProperty('image') &&
            data.hasOwnProperty('id') &&
            data.hasOwnProperty('attributes') &&
            Array.isArray(data.attributes)
        );
    };

    const mintNFT = async () => {
        setLoadingMint(true)
        try {
            const signer = await provider.getSigner();
            //Approve nft transfer
            let transaction = await realEstate.connect(signer).mint(url)
            await transaction.wait()
            setUrl('')
            toast.success('NFT minted successfully!');
            setLoadingMint(false)
        } catch (err) {
            console.log('mintNFT', err)
            toast.error('transaction failed, try again');
            setLoadingMint(false)
        }

    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.info('URL copied to clipboard!');
    };

    return (
        <div className="max-w-lg mx-auto">
            <div className="mt-8 p-4 bg-yellow-100 rounded">
                <p className="font-bold">Note to Judges:</p>
                <p>
                    This is a test version of the Real Estate NFT minting project. The functionality to mint on your own address is provided for testing and demonstration purposes.
                </p>
            </div>
            <div className='mt-8'>Mint on Your own address show you can own that property for test</div>
            <div className="mb-4 mt-2">
                <label htmlFor="url" className="block mb-2 font-bold text-gray-700">
                    URL:
                </label>
                <input
                    type="text"
                    id="url"
                    className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>
            <button
                className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                onClick={fetchNFTData}
            >
                Fetch NFT Data
            </button>



            {nftData && (
                <div className="mt-8">
                    <h2 className="mb-2 text-xl font-bold">{nftData.name}</h2>
                    <img src={nftData.image} alt={nftData.name} className="mb-4" />
                    <p className="mb-2">
                        <span className="font-bold">Address:</span> {nftData.address}
                    </p>
                    <p className="mb-2">
                        <span className="font-bold">City:</span> {nftData.city}
                    </p>
                    <p className="mb-2">
                        <span className="font-bold">Country:</span> {nftData.country}
                    </p>
                    <p className="mb-4">{nftData.description}</p>

                    <h3 className="mb-2 font-bold">Attributes:</h3>
                    <ul className="mb-4">
                        {nftData.attributes.map((attribute, index) => (
                            <li key={index}>
                                {attribute.trait_type}: {attribute.value}
                            </li>
                        ))}
                    </ul>
                    {account ?
                        <button
                            className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 focus:outline-none focus:shadow-outline"
                            onClick={mintNFT}
                            disabled={loadingMint}
                        >
                            {loadingMint ? <SmallSpinner /> : 'Mint NFT'}
                        </button> :
                        <ConnectWallet />}

                </div>
            )}
            <div className="mt-8">
                <h3 className="mb-2 font-bold">Required NFT Data Format:</h3>
                <pre className="p-4 mb-4 overflow-auto bg-gray-100 rounded">
                    {JSON.stringify(
                        {
                            name: 'Luxury NYC Penthouse',
                            address: '157 W 57th St APT 49B, New York, NY 10019',
                            city: 'New York',
                            country: 'USA',
                            description: 'Luxury Penthouse located in the heart of NYC',
                            image: 'https://ipfs.io/ipfs/QmQUozrHLAusXDxrvsESJ3PYB3rUeUuBAvVWw6nop2uu7c/1.png',
                            id: '1',
                            attributes: [
                                {
                                    trait_type: 'Purchase Price',
                                    value: 20,
                                },
                                {
                                    trait_type: 'Type of Residence',
                                    value: 'Condo',
                                },
                                {
                                    trait_type: 'Bed Rooms',
                                    value: 2,
                                },
                                {
                                    trait_type: 'Bathrooms',
                                    value: 3,
                                },
                                {
                                    trait_type: 'Square Feet',
                                    value: 2200,
                                },
                                {
                                    trait_type: 'Year Built',
                                    value: 2013,
                                },
                            ],
                        },
                        null,
                        2
                    )}
                </pre>
            </div>
            <div className="mt-8 pb-20">
                <h3 className="mb-2 font-bold">Example URLs For Testing:</h3>
                <ul className='space-y-4'>
                    {urlsList.map((url, idx) => <li key={idx}>
                        <div
                            className="inline-block px-2 py-1 mb-2 font-mono text-sm text-gray-800 bg-gray-200 rounded-md cursor-pointer"
                            onClick={() => copyToClipboard(url)}
                        >
                            {url}
                        </div>
                    </li>)}
                </ul>
            </div>
        </div>
    );
};

export default MintProperty;