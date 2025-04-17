import React, { useState, useEffect } from 'react';

// import { transferNFT, fetchOwnedNFTs } from '../solidityfunction/transfer';


const Transfer = () => {
  const [tokenId, setTokenId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);

  // Load user's owned NFTs when component mounts
  useEffect(() => {
    loadOwnedNFTs();
  }, []);

  const loadOwnedNFTs = async () => {
    try {
      setLoadingNFTs(true);
      const nfts = await fetchOwnedNFTs();
      setOwnedNFTs(nfts);
    } catch (err) {
      console.error("Error loading owned NFTs:", err);
      setError("Failed to load your NFTs. Please try again later.");
    } finally {
      setLoadingNFTs(false);
    }
  };

  // Update selected NFT when tokenId changes
  useEffect(() => {
    if (tokenId) {
      const nft = ownedNFTs.find(nft => nft.tokenId === tokenId);
      setSelectedNFT(nft || null);
    } else {
      setSelectedNFT(null);
    }
  }, [tokenId, ownedNFTs]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    // Reset state
    setError('');
    setSuccessMessage('');
    setTransactionHash('');
    
    // Validate inputs
    if (!tokenId) {
      setError("Please select an NFT to transfer");
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
      setIsLoading(true);
      
      // Execute the transfer
      const result = await transferNFT(tokenId, recipientAddress);
      
      // Set transaction hash immediately for user feedback
      setTransactionHash(result.transactionHash);
      setSuccessMessage(`Success! NFT with ID ${tokenId} transferred to ${recipientAddress}`);
      
      // Reset form values and update NFT list
      setTokenId('');
      setRecipientAddress('');
      setSelectedNFT(null);
      await loadOwnedNFTs();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render NFT image based on metadata
  const renderNFTImage = (metadata) => {
    try {
      let imageUrl = null;
      
      // If metadata is a string containing JSON
      if (typeof metadata === 'string' && metadata.startsWith('{')) {
        const parsedData = JSON.parse(metadata);
        imageUrl = parsedData.image || parsedData.external_link;
      } 
      // If metadata is already an object
      else if (typeof metadata === 'object' && metadata !== null) {
        imageUrl = metadata.image || metadata.external_link;
      }
      
      if (imageUrl) {
        return <img src={imageUrl} alt="NFT" className="w-full h-48 object-cover rounded-md" />;
      }
      
      return <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">No Image</div>;
    } catch (err) {
      console.error("Error rendering NFT image:", err);
      return <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">Image Error</div>;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Transfer Your NFT</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 mb-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* NFT Selection */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select NFT to Transfer</label>
        
        {loadingNFTs ? (
          <div className="p-4 text-center">Loading your NFTs...</div>
        ) : ownedNFTs.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded-md">
            You don't own any NFTs to transfer
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {ownedNFTs.map((nft) => (
              <div 
                key={nft.tokenId}
                className={`border rounded-md overflow-hidden cursor-pointer transition ${
                  tokenId === nft.tokenId ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setTokenId(nft.tokenId)}
              >
                <div className="h-36">
                  {renderNFTImage(nft.metadata)}
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
                  <p className="text-sm text-gray-500">Token ID: {nft.tokenId}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Transfer Form */}
      <form onSubmit={handleTransfer} className="border rounded-lg p-4 bg-gray-50">
        {/* Selected NFT Preview */}
        {selectedNFT && (
          <div className="mb-4 p-3 bg-white rounded-md">
            <h3 className="font-medium mb-2">Selected NFT:</h3>
            <div className="flex items-center">
              <div className="w-16 h-16 mr-3 overflow-hidden rounded-md">
                {renderNFTImage(selectedNFT.metadata)}
              </div>
              <div>
                <p className="font-medium">{selectedNFT.metadata?.name || `NFT #${selectedNFT.tokenId}`}</p>
                <p className="text-sm text-gray-500">Token ID: {selectedNFT.tokenId}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Token ID field (hidden but still part of the form) */}
        <input
          type="hidden"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        
        {/* Recipient Address */}
        <div className="mb-4">
          <label htmlFor="recipientAddress" className="block mb-2 font-medium">
            Recipient Address
          </label>
          <input
            id="recipientAddress"
            type="text"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the Ethereum address of the recipient
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !tokenId}
          className={`w-full py-3 rounded-md font-medium 
            ${isLoading || !tokenId 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          {isLoading ? "Processing..." : "Transfer NFT"}
        </button>
      </form>
      
      {/* Transaction Hash Section */}
      {transactionHash && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <p className="mb-2 font-medium">Transaction Hash:</p>
          <p className="break-all font-mono text-sm bg-white p-2 rounded-md">
            {transactionHash}
          </p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-blue-500 hover:underline"
          >
            View on Sepolia Etherscan
          </a>
        </div>
      )}
    </div>
  );
};

export default Transfer;