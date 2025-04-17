// src/services/uploadToPinata.js
import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const customGateway = "https://green-fancy-booby-179.mypinata.cloud/ipfs/";

// Get next token ID from localStorage
const getNextTokenId = () => {
  const current = localStorage.getItem("mintedTokenId");
  const nextId = current ? parseInt(current) + 1 : 1;
  localStorage.setItem("mintedTokenId", nextId);
  return nextId;
};

export const uploadToPinata = async (file, metadata) => {
  // Upload image to IPFS
  const formData = new FormData();
  formData.append("file", file);

  const fileRes = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  const imageHash = fileRes.data.IpfsHash;
  const imageUrl = `${customGateway}${imageHash}`;

  // Generate a token ID
  const tokenId = getNextTokenId();

  // Create metadata with tokenId and external_link
  const metadataToUpload = {
    name: metadata.name,
    description: metadata.description,
    royalty: metadata.royalty,
    external_link: imageUrl,
    token_id: tokenId,
    attributes: [
      {
        trait_type: "Royalty",
        value: metadata.royalty + "%",
      },
    ],
  };

  const metaRes = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadataToUpload,
    {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  return {
    imageUrl,
    metadataUrl: `${customGateway}${metaRes.data.IpfsHash}`,
    tokenId,
  };
};
