import { BrowserProvider, Contract } from "ethers";
import { contractABI, contractAddress } from "../components/contractABI";

export const buyNFTOnChain = async (tokenId) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    
    console.log("Preparing to buy NFT with token ID:", tokenId);
    
    // First, get the NFT price from the listing
    const allListings = await contract.getAllListings();
    const listing = allListings.find(item => item.tokenId.toString() === tokenId.toString());
    
    if (!listing || !listing.isActive) {
      throw new Error("This NFT is not available for sale");
    }
    
    const price = listing.price;
    console.log("NFT price:", price.toString());
    
    // Estimate gas to check if the transaction will succeed
    const gasEstimate = await contract.buyNFT.estimateGas(
      tokenId,
      { value: price }
    );
    
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Send the transaction with a gas limit slightly higher than the estimate
    const tx = await contract.buyNFT(
      tokenId,
      { 
        value: price,
        gasLimit: gasEstimate * 12n / 10n // Add 20% buffer to gas estimate
      }
    );
    
    console.log("Transaction sent:", tx.hash);
    
    // Show transaction hash to user
    alert(`Transaction submitted! Hash: ${tx.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // Check if transaction was successful
    if (receipt.status === 1) {
      alert(`NFT purchased successfully! Token ID: ${tokenId}`);
      return { receipt, tokenId };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Purchase failed:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Something went wrong while buying the NFT.";
    
    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected by the user.";
    } else if (error.reason) {
      errorMessage = `Purchase failed: ${error.reason}`;
    } else if (error.message) {
      errorMessage = `Purchase failed: ${error.message}`;
    }
    
    alert(errorMessage);
    throw error;
  }
};