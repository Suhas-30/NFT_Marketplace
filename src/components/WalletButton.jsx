import React, { useEffect, useState } from "react";
import { connectWallet } from "./ConnectWallet";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const WalletButton = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const { currentAccount, setCurrentAccount } = useWallet();
  const navigate = useNavigate();

  const handleConnect = async () => {
    const { signer } = await connectWallet();  // Ensure signer is returned
    if (signer) {
      const address = await signer.getAddress();  // Retrieve the address
      console.log("Connected wallet address:", address); // Debugging line
      setWalletAddress(address);
      setCurrentAccount(address);
    }
  };

  const handleNext = () => {
    navigate("/nft-market");
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(""); // Wallet disconnected
        }
      });
    }

    // Cleanup function to remove listener on unmount
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
      {walletAddress && <p>Connected: {walletAddress}</p>}
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default WalletButton;
