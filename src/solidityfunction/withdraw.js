import { BrowserProvider, Contract } from "ethers";
import { contractABI, contractAddress } from "../components/contractABI";
import axios from "axios";

// Try to fetch the metadata from IPFS URI
const fetchMetadata = async (tokenURI) => {
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

// Fetch all NFTs listed by the current user in the marketplace
export const fetchMyListedNFTs = async () => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    const userAddress = await signer.getAddress();
    
    console.log("Fetching listings for address:", userAddress);
    
    // Get all active listings from the marketplace
    const allListings = await contract.getAllListings();
    
    // Filter listings that belong to the current user
    const myListingsPromises = allListings
      .filter(listing => listing.seller.toLowerCase() === userAddress.toLowerCase())
      .map(async (listing) => {
        try {
          // Get NFT details from the contract
          const nft = await contract.getNFT(listing.tokenId);
          
          // Try to fetch the metadata
          const metadata = await fetchMetadata(nft.tokenURI);
          
          return {
            tokenId: listing.tokenId.toString(),
            price: listing.price.toString(),
            seller: listing.seller,
            isActive: listing.isActive,
            tokenURI: nft.tokenURI,
            metadata: metadata || { name: `NFT #${listing.tokenId}` }
          };
        } catch (err) {
          console.error(`Error processing NFT ${listing.tokenId}:`, err);
          // Return basic info without metadata if there's an error
          return {
            tokenId: listing.tokenId.toString(),
            price: listing.price.toString(),
            seller: listing.seller,
            isActive: listing.isActive
          };
        }
      });
    
    const myListings = await Promise.all(myListingsPromises);
    console.log(`Found ${myListings.length} NFTs listed by the user`);
    return myListings;
  } catch (error) {
    console.error("Error fetching listed NFTs:", error);
    throw new Error(error.message || "Failed to load your NFTs");
  }
};

// Withdraw an NFT from the marketplace
export const withdrawNFTFromMarketplace = async (tokenId) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    
    console.log(`Preparing to withdraw NFT with token ID: ${tokenId}`);
    
    // Estimate gas for the withdrawal
    const gasEstimate = await contract.withdrawNFT.estimateGas(tokenId);
    
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Send the transaction with a gas buffer
    const tx = await contract.withdrawNFT(tokenId, {
      gasLimit: gasEstimate * 12n / 10n // Add 20% buffer
    });
    
    console.log("Withdrawal transaction submitted:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Withdrawal confirmed:", receipt);
    
    if (receipt.status === 1) {
      console.log(`Successfully withdrawn NFT #${tokenId}`);
      return { success: true, receipt };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Withdrawal failed:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Something went wrong while withdrawing your NFT.";
    
    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected by the user.";
    } else if (error.reason) {
      errorMessage = `Withdrawal failed: ${error.reason}`;
    } else if (error.message) {
      errorMessage = `Withdrawal failed: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};