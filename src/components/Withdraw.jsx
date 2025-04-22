import React, { useState, useEffect } from 'react';
import { fetchMyListedNFTs, withdrawNFTFromMarketplace } from '../solidityfunction/withdraw';

const Withdraw = () => {
  const [listedNFTs, setListedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState({});

  // Styles object - consolidated for brevity
  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "1rem" },
    header: { fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#2c3e50" },
    loadingBox: { display: "flex", justifyContent: "center", alignItems: "center", height: "10rem" },
    errorBox: { backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.375rem" },
    errorText: { color: "#dc2626" },
    button: { backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", 
              border: "none", cursor: "pointer", marginTop: "0.5rem" },
    emptyState: { backgroundColor: "#f3f4f6", padding: "1.5rem", borderRadius: "0.375rem", 
                  textAlign: "center", color: "#4b5563" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
    card: { border: "1px solid #e5e7eb", borderRadius: "0.375rem", overflow: "hidden", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)" },
    cardImage: { width: "100%", height: "10rem", objectFit: "cover" },
    placeholder: { height: "10rem", backgroundColor: "#e5e7eb", display: "flex", 
                   alignItems: "center", justifyContent: "center", color: "#6b7280" },
    cardContent: { padding: "0.75rem" },
    cardTitle: { fontWeight: "600", fontSize: "1rem", marginBottom: "0.25rem" },
    cardDesc: { fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" },
    cardInfo: { color: "#4b5563", marginBottom: "0.25rem", fontSize: "0.875rem" },
    withdrawBtn: (status) => ({
      width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: "none",
      backgroundColor: status === 'processing' ? "#9ca3af" : "#ef4444",
      color: "white", cursor: status === 'processing' ? "not-allowed" : "pointer"
    }),
    success: { marginTop: "0.5rem", color: "#16a34a", fontSize: "0.75rem" },
    failure: { marginTop: "0.5rem", color: "#dc2626", fontSize: "0.75rem" }
  };

  useEffect(() => {
    loadMyListedNFTs();
  }, []);

  const loadMyListedNFTs = async () => {
    try {
      setLoading(true);
      const myNFTs = await fetchMyListedNFTs();
      setListedNFTs(myNFTs);
    } catch (err) {
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
      setListedNFTs(prev => prev.filter(nft => nft.tokenId !== tokenId));
    } catch (err) {
      setWithdrawStatus(prev => ({ ...prev, [tokenId]: 'error' }));
      alert(`Failed to withdraw NFT: ${err.message || "Unknown error"}`);
    }
  };

  const renderNFTImage = (metadata) => {
    try {
      let imageUrl = null;
      
      if (typeof metadata === 'string' && metadata.startsWith('{')) {
        const parsedData = JSON.parse(metadata);
        imageUrl = parsedData.image || parsedData.external_link;
      } else if (typeof metadata === 'object' && metadata !== null) {
        imageUrl = metadata.image || metadata.external_link;
      }
      
      return imageUrl 
        ? <img src={imageUrl} alt="NFT" style={styles.cardImage} />
        : <div style={styles.placeholder}>No Image</div>;
    } catch {
      return <div style={styles.placeholder}>Image Error</div>;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Your Listed NFTs</h1>
        <div style={styles.loadingBox}>Loading your listed NFTs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Your Listed NFTs</h1>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => { setError(null); loadMyListedNFTs(); }} style={styles.button}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (priceWei) => {
    return (parseInt(priceWei) / 1e18).toFixed(4) + " ETH";
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Your Listed NFTs</h1>
      
      {listedNFTs.length === 0 ? (
        <div style={styles.emptyState}>
          <p>You don't have any NFTs listed in the marketplace.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {listedNFTs.map((nft) => (
            <div key={nft.tokenId} style={styles.card}>
              {renderNFTImage(nft.metadata)}
              
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
                <p style={styles.cardDesc}>{nft.metadata?.description || "No description"}</p>
                <p style={styles.cardInfo}>Token ID: {nft.tokenId}</p>
                <p style={styles.cardInfo}>Price: {formatPrice(nft.price)}</p>
                
                <button
                  onClick={() => handleWithdraw(nft.tokenId)}
                  disabled={withdrawStatus[nft.tokenId] === 'processing'}
                  style={styles.withdrawBtn(withdrawStatus[nft.tokenId])}
                >
                  {withdrawStatus[nft.tokenId] === 'processing' ? 'Processing...' : 'Remove from Marketplace'}
                </button>
                
                {withdrawStatus[nft.tokenId] === 'success' && (
                  <p style={styles.success}>Successfully withdrawn!</p>
                )}
                
                {withdrawStatus[nft.tokenId] === 'error' && (
                  <p style={styles.failure}>Failed to withdraw.</p>
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