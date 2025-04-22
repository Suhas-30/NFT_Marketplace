// src/solidityfunction/transfer.js

import { BrowserProvider, Contract } from "ethers";
import { contractABI, contractAddress } from "../components/contractABI";
import axios from "axios";

// Fetch metadata from tokenURI
export const fetchMetadata = async (tokenURI) => {
  try {
    // Check if the tokenURI is already a JSON string
    if (tokenURI && tokenURI.startsWith('{')) {
      return JSON.parse(tokenURI);
    }
    
    // Check if tokenURI is a URL we can fetch
    if (tokenURI && (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs'))) {
      // If it's an IPFS URI but not the gateway URL, convert it
      if (tokenURI.startsWith('ipfs://')) {
        const ipfsHash = tokenURI.replace('ipfs://', '');
        tokenURI = `https://green-fancy-booby-179.mypinata.cloud/ipfs/${ipfsHash}`;
      }
      
      // Fetch the metadata
      const response = await axios.get(tokenURI);
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
};

// Fetch all NFTs owned by the current user
export const fetchOwnedNFTs = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    const userAddress = await signer.getAddress();
    
    console.log("Fetching owned NFTs for address:", userAddress);
    
    // Get the total number of tokens minted
    const totalTokens = await contract._tokenIdCounter();
    console.log("Total tokens minted:", totalTokens.toString());
    
    // Array to store owned NFTs
    const ownedNFTsPromises = [];
    
    // Loop through all token IDs and check ownership
    for (let i = 1; i <= totalTokens; i++) {
      try {
        const owner = await contract.ownerOf(i);
        
        // If the current user owns this NFT
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          // Get the NFT data
          const nft = await contract.getNFT(i);
          const tokenURI = await contract.tokenURI(i);
          
          // Try to fetch metadata
          const metadata = await fetchMetadata(tokenURI);
          
          ownedNFTsPromises.push({
            tokenId: i.toString(),
            owner: owner,
            creator: nft.creator,
            tokenURI: tokenURI,
            royaltyPercentage: nft.royaltyPercentage.toString(),
            metadata: metadata || { name: `NFT #${i}` }
          });
        }
      } catch (err) {
        // Skip tokens that don't exist or have issues
        console.error(`Error checking token ${i}:`, err);
      }
    }
    
    const ownedNFTs = await Promise.all(ownedNFTsPromises);
    console.log(`Found ${ownedNFTs.length} NFTs owned by the user`);
    return ownedNFTs;
  } catch (error) {
    console.error("Error fetching owned NFTs:", error);
    throw new Error(error.message || "Failed to load your NFTs");
  }
};

// Transfer NFT to another address
export const transferNFT = async (tokenId, recipientAddress) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    // Get provider and signer
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    
    // Check that user owns the NFT
    const owner = await contract.ownerOf(tokenId);
    const userAddress = await signer.getAddress();
    
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error("You don't own this NFT");
    }
    
    // Execute transfer transaction
    console.log(`Transferring NFT #${tokenId} to ${recipientAddress}...`);
    const tx = await contract.transferNFT(tokenId, recipientAddress);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transfer successful:", receipt);
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error("Error transferring NFT:", error);
    throw new Error(error.message || "Failed to transfer NFT. Please try again.");
  }
};