import React, { useState } from 'react';
import { useWallet } from "../context/WalletContext";
import { listNFTOnChain } from "../solidityfunction/list"; // Make sure to create this file

const List = () => {
  const { currentAccount } = useWallet();
  const [tokenId, setTokenId] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!tokenId || !price) {
      alert("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the list function
      const { receipt } = await listNFTOnChain(tokenId, price);
      
      if (receipt && receipt.hash) {
        setTxHash(receipt.hash);
      }
      
      // Clear form after successful listing
      setTokenId('');
      setPrice('');
      
    } catch (err) {
      console.error("Error during listing process:", err);
      // Error alert is handled in listNFTOnChain
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2>List Your NFT For Sale</h2>
      
      {!currentAccount && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Please connect your wallet before listing
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="tokenId">Token ID</label>
          <input
            id="tokenId"
            type="text"
            placeholder="Enter your NFT token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="price">Price (ETH)</label>
          <input
            id="price"
            type="number"
            placeholder="Enter price in ETH"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.001"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !currentAccount}
          style={{ 
            padding: "0.75rem 1.5rem", 
            backgroundColor: currentAccount ? "#4CAF50" : "#cccccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: currentAccount ? "pointer" : "not-allowed"
          }}
        >
          {loading ? "Processing..." : "List NFT"}
        </button>
      </form>

      {/* Results Section */}
      {txHash && (
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#e8f5e9", borderRadius: "4px" }}>
          <p><strong>Transaction Hash:</strong> {txHash}</p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: "inline-block", 
              marginTop: "0.5rem",
              color: "#4CAF50",
              textDecoration: "none"
            }}
          >
            View on Sepolia Etherscan
          </a>
        </div>
      )}
    </div>
  );
};

export default List;