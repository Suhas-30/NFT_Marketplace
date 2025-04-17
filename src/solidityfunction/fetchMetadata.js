import axios from "axios";

export const fetchNFTMetadata = async (tokenURI) => {
  try {
    // If the tokenURI is already a full URL
    if (tokenURI.startsWith('http')) {
      const response = await axios.get(tokenURI);
      return response.data;
    } 
    // If the tokenURI is an IPFS hash
    else if (tokenURI.startsWith('ipfs://')) {
      const ipfsGateway = "https://green-fancy-booby-179.mypinata.cloud/ipfs/";
      const ipfsHash = tokenURI.replace('ipfs://', '');
      const url = `${ipfsGateway}${ipfsHash}`;
      const response = await axios.get(url);
      return response.data;
    }
    // Handle plain IPFS hash
    else {
      const ipfsGateway = "https://green-fancy-booby-179.mypinata.cloud/ipfs/";
      const url = `${ipfsGateway}${tokenURI}`;
      const response = await axios.get(url);
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return null;
  }
};