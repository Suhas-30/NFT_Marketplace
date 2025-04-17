import { BrowserProvider, Contract, formatEther } from "ethers";
import { contractABI, contractAddress } from "../components/contractABI";
import { fetchNFTMetadata } from "./fetchMetaData";

export const getListingsFromContract = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const contract = new Contract(contractAddress, contractABI, provider);
    
    // Call the function to get all listings
    const rawListings = await contract.getAllListings();
    console.log("Raw listings data:", rawListings);
    
    // Process the listings and fetch metadata for each token
    const listingsPromises = rawListings.map(async (listing) => {
      const tokenId = listing[0].toString();
      const seller = listing[1];
      const price = formatEther(listing[2]); // Convert from Wei to ETH
      const isActive = listing[3];
      
      try {
        // Get the token URI from the contract
        const tokenURI = await contract.tokenURI(tokenId);
        console.log(`Token ${tokenId} URI:`, tokenURI);
        
        // Fetch the metadata using the token URI
        const metadata = await fetchNFTMetadata(tokenURI);
        
        return {
          tokenId,
          seller,
          price,
          isActive,
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || "",
          imageUrl: metadata?.external_link || metadata?.image || null
        };
      } catch (error) {
        console.error(`Error fetching metadata for token ${tokenId}:`, error);
        return {
          tokenId,
          seller,
          price,
          isActive,
          name: `NFT #${tokenId}`,
          description: "",
          imageUrl: null
        };
      }
    });
    
    const listings = await Promise.all(listingsPromises);
    console.log("Processed listings with metadata:", listings);
    return listings;
    
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    throw error;
  }
};