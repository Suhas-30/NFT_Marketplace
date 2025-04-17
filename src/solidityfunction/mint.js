import { BrowserProvider, Contract } from "ethers";
import { contractABI, contractAddress } from "../components/contractABI";

export const mintNFTOnChain = async (uri, royaltyPercentage, name, description) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask is not installed!");
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    
    console.log("Preparing to mint NFT:", { uri, royaltyPercentage, name, description });
    
    // Convert royalty to the format expected by the contract (integer percentage)
    const royaltyValue = parseInt(royaltyPercentage);
    if (isNaN(royaltyValue) || royaltyValue < 0 || royaltyValue > 10) {
      throw new Error("Royalty must be a number between 0 and 10");
    }
    
    // Estimate gas to check if the transaction will succeed
    const gasEstimate = await contract.mintNFT.estimateGas(
      uri, royaltyValue, name, description
    );
    
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Send the transaction with a gas limit slightly higher than the estimate
    const tx = await contract.mintNFT(
      uri, royaltyValue, name, description,
      { gasLimit: gasEstimate * 12n / 10n } // Add 20% buffer to gas estimate
    );
    
    console.log("Transaction sent:", tx.hash);
    
    // Show transaction hash to user
    alert(`Transaction submitted! Hash: ${tx.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // Extract token ID from the event logs
    let tokenId = null;
    
    // Look for the Minted event in the logs
    for (const log of receipt.logs) {
      try {
        // Try to parse each log
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        
        // Check if this is the Minted event
        if (parsedLog && parsedLog.name === 'Minted') {
          tokenId = parsedLog.args[0]; // The first argument should be tokenId
          console.log("Minted token ID:", tokenId.toString());
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
        continue;
      }
    }
    
    // Check if transaction was successful
    if (receipt.status === 1) {
      if (tokenId) {
        alert(`NFT minted successfully! Token ID: ${tokenId.toString()}`);
      } else {
        alert("NFT minted successfully!");
      }
      return { receipt, tokenId };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Minting failed:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Something went wrong while minting your NFT.";
    
    if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected by the user.";
    } else if (error.reason) {
      errorMessage = `Minting failed: ${error.reason}`;
    } else if (error.message) {
      errorMessage = `Minting failed: ${error.message}`;
    }
    
    alert(errorMessage);
    throw error;
  }
};