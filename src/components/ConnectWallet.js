import { BrowserProvider, Contract } from "ethers";
import { contractABI, contractAddress } from "./contractABI";

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const provider = new BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      return { contract, signer }; // return both
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  } else {
    alert("MetaMask is not installed!");
  }
};
