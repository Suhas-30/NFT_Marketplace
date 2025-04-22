import React, { useState } from 'react';
import { useWallet } from "../context/WalletContext";
import { transferNFT } from '../solidityfunction/transfer';

const Transfer = () => {
  const { currentAccount } = useWallet();
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    // Reset state
    setError('');
    setSuccessMessage('');
    setTxHash('');
    
    if (!currentAccount) {
      setError("Please connect your wallet first");
      return;
    }
    
    // Validate inputs
    if (!tokenId) {
      setError("Please enter an NFT Token ID");
      return;
    }
    
    if (!recipientAddress) {
      setError("Please enter a recipient address");
      return;
    }
    
    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      setError("Please enter a valid Ethereum address");
      return;
    }
    
    try {
      setLoading(true);
      
      // Execute the transfer
      const result = await transferNFT(tokenId, recipientAddress);
      
      // Set transaction hash immediately for user feedback
      setTxHash(result.transactionHash);
      setSuccessMessage(`Success! NFT with ID ${tokenId} transferred to ${recipientAddress}`);
      
      // Reset form values
      setTokenId('');
      setRecipientAddress('');
      
    } catch (err) {
      setError(err.message || "Failed to transfer NFT. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Transfer Your NFT</h2>
      
      {error && (
        <div style={{ 
          padding: "0.75rem", 
          marginBottom: "1rem", 
          backgroundColor: "#FEECED", 
          color: "#D32F2F", 
          border: "1px solid #FECDD0", 
          borderRadius: "4px" 
        }}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div style={{ 
          padding: "0.75rem", 
          marginBottom: "1rem", 
          backgroundColor: "#e8f5e9", 
          color: "#43a047", 
          border: "1px solid #c8e6c9", 
          borderRadius: "4px" 
        }}>
          {successMessage}
        </div>
      )}
      
      {!currentAccount && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Please connect your wallet before transferring NFTs
        </div>
      )}
      
      <form onSubmit={handleTransfer} style={{ 
        border: "1px solid #e0e0e0", 
        borderRadius: "8px", 
        padding: "1.5rem", 
        backgroundColor: "#f9f9f9" 
      }}>
        {/* Token ID Input */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="tokenId" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            NFT Token ID
          </label>
          <input
            id="tokenId"
            type="text"
            placeholder="Enter token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            disabled={loading}
          />
          <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
            Enter the ID of the NFT you want to transfer
          </p>
        </div>
        
        {/* Recipient Address */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="recipientAddress" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Recipient Address
          </label>
          <input
            id="recipientAddress"
            type="text"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            disabled={loading}
          />
          <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>
            Enter the Ethereum address of the recipient
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !currentAccount || !tokenId || !recipientAddress}
          style={{ 
            width: "100%", 
            padding: "0.75rem 1.5rem", 
            borderRadius: "4px",
            fontWeight: "500",
            backgroundColor: (loading || !currentAccount || !tokenId || !recipientAddress) 
              ? "#cccccc" 
              : "#2196F3",
            color: "white",
            border: "none",
            cursor: (loading || !currentAccount || !tokenId || !recipientAddress) 
              ? "not-allowed" 
              : "pointer",
            transition: "background-color 0.3s"
          }}
        >
          {loading ? "Processing..." : "Transfer NFT"}
        </button>
      </form>
      
      {/* Transaction Hash Section */}
      {txHash && (
        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          backgroundColor: "#e8f5e9", 
          borderRadius: "4px" 
        }}>
          <p style={{ fontWeight: "500", marginBottom: "0.5rem" }}>Transaction Hash:</p>
          <p style={{ 
            wordBreak: "break-all", 
            fontFamily: "monospace", 
            fontSize: "0.875rem", 
            backgroundColor: "white", 
            padding: "0.5rem", 
            borderRadius: "4px" 
          }}>
            {txHash}
          </p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: "inline-block", 
              marginTop: "0.5rem",
              color: "#2196F3",
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

export default Transfer;