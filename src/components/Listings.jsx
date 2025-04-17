import React, { useState, useEffect } from 'react';
import { getListingsFromContract } from "../solidityfunction/listings";
import { useWallet } from "../context/WalletContext";
import { buyNFTOnChain } from '../solidityfunction/buy';

const Listings = () => {
  const { currentAccount } = useWallet();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [buyingStatus, setBuyingStatus] = useState({
    isProcessing: false,
    tokenId: null,
    status: '', // 'success', 'error'
    message: ''
  });

  // Function to fetch listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await getListingsFromContract();
      // Filter to only show active listings
      const activeListings = data.filter(listing => listing.isActive);
      setListings(activeListings);
      setError(null);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load listings when the component mounts
  useEffect(() => {
    fetchListings();
  }, []);

  // Reset buying status after some time
  useEffect(() => {
    if (buyingStatus.status === 'success' || buyingStatus.status === 'error') {
      const timer = setTimeout(() => {
        setBuyingStatus({
          isProcessing: false,
          tokenId: null,
          status: '',
          message: ''
        });
      }, 8000); // Clear message after 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [buyingStatus.status]);

  // Function to handle buying an NFT
  const handleBuyNFT = async (tokenId, price) => {
    setBuyingStatus({
      isProcessing: true,
      tokenId: tokenId,
      status: '',
      message: 'Transaction in progress...'
    });
    
    try {
      const { receipt } = await buyNFTOnChain(tokenId);
      
      if (receipt && receipt.hash) {
        setTxHash(receipt.hash);
        setBuyingStatus({
          isProcessing: false,
          tokenId: tokenId,
          status: 'success',
          message: `Success! Transaction hash: ${receipt.hash.substring(0, 10)}...`
        });
        
        // Refresh listings after successful purchase
        fetchListings();
      }
    } catch (err) {
      console.error("Error during buying process:", err);
      setBuyingStatus({
        isProcessing: false,
        tokenId: tokenId,
        status: 'error',
        message: `Error: ${err.message || 'Transaction failed'}`
      });
    }
  };

  // Function to truncate an address for display
  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to display transaction hash in a readable format
  const displayTxHash = (hash) => {
    return hash ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}` : '';
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>NFT Marketplace</h2>
        <button 
          onClick={fetchListings}
          style={{ 
            padding: "0.5rem 1rem", 
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Refresh Listings
        </button>
      </div>

      {/* Transaction Status Message */}
      {buyingStatus.status && (
        <div style={{ 
          padding: "1rem", 
          margin: "0 0 1.5rem 0", 
          backgroundColor: buyingStatus.status === 'success' ? "#e8f5e9" : "#ffebee",
          color: buyingStatus.status === 'success' ? "#2e7d32" : "#c62828",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0 }}>{buyingStatus.message}</p>
          {buyingStatus.status === 'success' && txHash && (
            <a 
              href={`https://etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#1976d2', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}
            >
              View on Etherscan
            </a>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading listings...</p>
        </div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center", padding: "2rem" }}>
          <p>{error}</p>
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>No active listings found.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {listings.map((listing) => (
            <div 
              key={listing.tokenId} 
              style={{ 
                border: "1px solid #e0e0e0", 
                borderRadius: "8px", 
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ 
                height: "200px", 
                backgroundColor: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden"
              }}>
                {listing.imageUrl ? (
                  <img 
                    src={listing.imageUrl} 
                    alt={listing.name} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover" 
                    }} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                    }}
                  />
                ) : (
                  <div style={{ 
                    textAlign: "center", 
                    color: "#999", 
                    fontSize: "0.9rem" 
                  }}>
                    No image available
                  </div>
                )}
              </div>
              
              <div style={{ padding: "1rem" }}>
                <h3 style={{ marginTop: 0 }}>{listing.name || `NFT #${listing.tokenId}`}</h3>
                
                {listing.description && (
                  <p style={{ 
                    margin: "0.5rem 0", 
                    fontSize: "0.9rem", 
                    color: "#666",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {listing.description}
                  </p>
                )}
                
                <p style={{ margin: "0.5rem 0", fontWeight: "bold", fontSize: "1.1rem" }}>
                  {listing.price} ETH
                </p>
                
                <p style={{ margin: "0.5rem 0", fontSize: "0.8rem", color: "#666" }}>
                  Token ID: {listing.tokenId}
                </p>
                
                <p style={{ margin: "0.5rem 0", fontSize: "0.8rem", color: "#666" }}>
                  Seller: {truncateAddress(listing.seller)}
                </p>
                
                {currentAccount && (
                  <button 
                    onClick={() => handleBuyNFT(listing.tokenId, listing.price)}
                    disabled={buyingStatus.isProcessing && buyingStatus.tokenId === listing.tokenId}
                    style={{ 
                      width: "100%",
                      padding: "0.75rem", 
                      backgroundColor: buyingStatus.isProcessing && buyingStatus.tokenId === listing.tokenId ? 
                        "#cccccc" : "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: buyingStatus.isProcessing && buyingStatus.tokenId === listing.tokenId ? 
                        "not-allowed" : "pointer",
                      marginTop: "1rem",
                      position: "relative"
                    }}
                  >
                    {buyingStatus.isProcessing && buyingStatus.tokenId === listing.tokenId ? (
                      <span>Processing...</span>
                    ) : (
                      <span>Buy Now</span>
                    )}
                  </button>
                )}
                
                {!currentAccount && (
                  <p style={{ color: "orange", fontSize: "0.9rem", marginTop: "1rem", textAlign: "center" }}>
                    Connect wallet to buy this NFT
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;