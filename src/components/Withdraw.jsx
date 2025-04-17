import React, { useState, useEffect } from 'react';
import { fetchMyListedNFTs, withdrawNFTFromMarketplace } from '../solidityfunction/withdraw';


const Withdraw = () => {
  const [listedNFTs, setListedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState({});

  useEffect(() => {
    loadMyListedNFTs();
  }, []);

  const loadMyListedNFTs = async () => {
    try {
      setLoading(true);
      const myNFTs = await fetchMyListedNFTs();
      setListedNFTs(myNFTs);
    } catch (err) {
      console.error("Error loading NFTs:", err);
      setError(err.message || "Failed to fetch your listed NFTs");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (tokenId) => {
    try {
      setWithdrawStatus(prev => ({ ...prev, [tokenId]: 'processing' }));
      await withdrawNFTFromMarketplace(tokenId);
      setWithdrawStatus(prev => ({ ...prev, [tokenId]: 'success' }));
      // Remove the withdrawn NFT from the list
      setListedNFTs(prev => prev.filter(nft => nft.tokenId !== tokenId));
    } catch (err) {
      console.error("Error withdrawing NFT:", err);
      setWithdrawStatus(prev => ({ ...prev, [tokenId]: 'error' }));
      alert(`Failed to withdraw NFT: ${err.message || "Unknown error"}`);
    }
  };

  const formatPrice = (priceWei) => {
    // Convert wei to ETH and format with 4 decimal places
    const priceEth = parseInt(priceWei) / 1e18;
    return priceEth.toFixed(4) + " ETH";
  };
  
  // Displays the NFT image from metadata
  const renderNFTImage = (metadata) => {
    try {
      let imageUrl = null;
      
      // If tokenURI is a string containing JSON
      if (typeof metadata === 'string' && metadata.startsWith('{')) {
        const parsedData = JSON.parse(metadata);
        // Check multiple possible image sources based on your structure
        imageUrl = parsedData.image || parsedData.external_link;
      } 
      // If tokenURI is already an object with image or external_link
      else if (typeof metadata === 'object' && metadata !== null) {
        imageUrl = metadata.image || metadata.external_link;
      }
      
      if (imageUrl) {
        return <img src={imageUrl} alt="NFT" className="w-full h-48 object-cover rounded-t-md" />;
      }
      
      // Default placeholder if no image found
      return <div className="h-48 bg-gray-200 flex items-center justify-center rounded-t-md">No Image Available</div>;
    } catch (err) {
      console.error("Error rendering NFT image:", err);
      return <div className="h-48 bg-gray-200 flex items-center justify-center rounded-t-md">Image Error</div>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Listed NFTs</h1>
        <div className="flex justify-center items-center h-40">
          <p>Loading your listed NFTs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Listed NFTs</h1>
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadMyListedNFTs();
            }}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Listed NFTs</h1>
      
      {listedNFTs.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-md text-center">
          <p>You don't have any NFTs listed in the marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listedNFTs.map((nft) => (
            <div key={nft.tokenId} className="border rounded-md shadow-sm overflow-hidden">
              {renderNFTImage(nft.metadata)}
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
                <p className="text-sm text-gray-500 mb-3">{nft.metadata?.description || "No description available"}</p>
                <p className="text-gray-700 mb-1">Token ID: {nft.tokenId}</p>
                <p className="text-gray-700 mb-3">Listed Price: {formatPrice(nft.price)}</p>
                
                {nft.metadata?.royalty && (
                  <p className="text-gray-600 mb-3">Royalty: {nft.metadata.royalty}%</p>
                )}
                
                <button
                  onClick={() => handleWithdraw(nft.tokenId)}
                  disabled={withdrawStatus[nft.tokenId] === 'processing'}
                  className={`w-full py-2 px-4 rounded-md transition ${
                    withdrawStatus[nft.tokenId] === 'processing' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {withdrawStatus[nft.tokenId] === 'processing' 
                    ? 'Processing...' 
                    : 'Remove from Marketplace'}
                </button>
                
                {withdrawStatus[nft.tokenId] === 'success' && (
                  <p className="mt-2 text-green-600 text-sm">Successfully withdrawn!</p>
                )}
                
                {withdrawStatus[nft.tokenId] === 'error' && (
                  <p className="mt-2 text-red-600 text-sm">Failed to withdraw.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Withdraw;