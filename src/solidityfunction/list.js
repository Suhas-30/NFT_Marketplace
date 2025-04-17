import { BrowserProvider, Contract, parseEther } from "ethers";
import { contractABI, contractAddress } from "../components/contractABI";

export const listNFTOnChain = async (tokenId, price) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    
    console.log("Preparing to list NFT:", { tokenId, price });
    
    // Convert price to Wei (ETH → Wei)
    const priceInWei = parseEther(price.toString());
    
    // Estimate gas to check if the transaction will succeed
    const gasEstimate = await contract.listNFT.estimateGas(
      tokenId, priceInWei
    );
    
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Send the transaction with a gas limit slightly higher than the estimate
    const tx = await contract.listNFT(
      tokenId, priceInWei,
      { gasLimit: gasEstimate * 12n / 10n } // Add 20% buffer to gas estimate
    );
    
    console.log("Transaction sent:", tx.hash);
    
    // Show transaction hash to user
    alert(`Transaction submitted! Hash: ${tx.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // Check if transaction was successful
    if (receipt.status === 1) {
      alert(`NFT listed successfully! Token ID: ${tokenId}`);
      return { receipt, tokenId };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Listing failed:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Something went wrong while listing your NFT.";
    
    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected by the user.";
    } else if (error.reason) {
      errorMessage = `Listing failed: ${error.reason}`;
    } else if (error.message) {
      errorMessage = `Listing failed: ${error.message}`;
    }
    
    alert(errorMessage);
    throw error;
  }
};