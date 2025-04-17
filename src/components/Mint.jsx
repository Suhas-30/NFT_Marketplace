import React, { useState } from "react";
import { uploadToPinata } from "./uploadToPinata";
import { mintNFTOnChain } from "../solidityfunction/mint";
import { useWallet } from "../context/WalletContext";

const Mint = () => {
  const { currentAccount } = useWallet();
  const [nftName, setNftName] = useState("");
  const [description, setDescription] = useState("");
  const [royalty, setRoyalty] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metadataUrl, setMetadataUrl] = useState("");
  const [txHash, setTxHash] = useState("");
  const [tokenId, setTokenId] = useState(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Reset form
  const resetForm = () => {
    setNftName("");
    setDescription("");
    setRoyalty("");
    setImage(null);
    setPreview(null);
    // Don't reset the results (metadata, txHash, tokenId) so the user can still see them
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return alert("Please upload an image");
    if (!currentAccount) return alert("Please connect your wallet first");
    
    // Validate royalty is within contract limits (0-10%)
    const royaltyValue = parseFloat(royalty);
    if (isNaN(royaltyValue) || royaltyValue < 0 || royaltyValue > 10) {
      return alert("Royalty must be between 0 and 10 percent");
    }

    setLoading(true);
    setTxHash("");
    setTokenId(null);

    try {
      const metadata = {
        name: nftName,
        description,
        royalty: royaltyValue,
        image: null, // This will be set by uploadToPinata
      };

      // Upload image and metadata to Pinata
      const result = await uploadToPinata(image, metadata);
      console.log("Metadata uploaded:", result);
      setMetadataUrl(result.metadataUrl);

      // Now, mint the NFT on-chain
      const { receipt, tokenId: newTokenId } = await mintNFTOnChain(
        result.metadataUrl, 
        royaltyValue, 
        nftName, 
        description
      );
      
      if (receipt && receipt.hash) {
        setTxHash(receipt.hash);
      }
      
      if (newTokenId) {
        setTokenId(newTokenId.toString());
      }
      
      // Reset form after successful mint
      resetForm();
      
    } catch (err) {
      console.error("Error during minting process:", err);
      // Error alert is handled in mintNFTOnChain
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h2>Mint Your NFT</h2>
      
      {!currentAccount && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Please connect your wallet before minting
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="nftName">NFT Name</label>
          <input
            id="nftName"
            type="text"
            placeholder="NFT Name"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", minHeight: "100px" }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="royalty">Royalty Percentage (0-10%)</label>
          <input
            id="royalty"
            type="number"
            placeholder="Royalty Percentage"
            value={royalty}
            onChange={(e) => setRoyalty(e.target.value)}
            min="0"
            max="10"
            step="0.1"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="image">Upload Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        
        {preview && (
          <div style={{ marginBottom: "1rem" }}>
            <p>Preview:</p>
            <img 
              src={preview} 
              alt="NFT Preview" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: "200px", 
                objectFit: "contain" 
              }} 
            />
          </div>
        )}
        
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
          {loading ? "Processing..." : "Mint NFT"}
        </button>
      </form>

      {/* Results Section */}
      <div style={{ marginTop: "2rem" }}>
        {tokenId && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#e6f7ff", borderRadius: "4px" }}>
            <p><strong>NFT Token ID: {tokenId}</strong></p>
            <p>You can reference this token ID when interacting with your NFT.</p>
            <button 
              onClick={() => copyToClipboard(tokenId)}
              style={{ padding: "0.5rem", marginTop: "0.5rem" }}
            >
              Copy Token ID
            </button>
          </div>
        )}
        
        {metadataUrl && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            <p><strong>Metadata URL:</strong></p>
            <div style={{ display: "flex", marginBottom: "0.5rem" }}>
              <input 
                type="text" 
                value={metadataUrl} 
                readOnly 
                style={{ flex: 1, padding: "0.5rem" }} 
              />
              <button 
                onClick={() => copyToClipboard(metadataUrl)}
                style={{ marginLeft: "0.5rem", padding: "0.5rem" }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
        
        {txHash && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#e8f5e9", borderRadius: "4px" }}>
            <p><strong>Transaction Hash:</strong></p>
            <div style={{ display: "flex", marginBottom: "0.5rem" }}>
              <input 
                type="text" 
                value={txHash} 
                readOnly 
                style={{ flex: 1, padding: "0.5rem" }} 
              />
              <button 
                onClick={() => copyToClipboard(txHash)}
                style={{ marginLeft: "0.5rem", padding: "0.5rem" }}
              >
                Copy
              </button>
            </div>
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
        
        {(tokenId || metadataUrl || txHash) && (
          <button 
            onClick={() => {
              setTokenId(null);
              setMetadataUrl("");
              setTxHash("");
            }}
            style={{ 
              padding: "0.5rem 1rem", 
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "0.5rem"
            }}
          >
            Clear Results
          </button>
        )}
      </div>
    </div>
  );
};

export default Mint;