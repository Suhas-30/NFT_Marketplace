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

  const containerStyle = {
    padding: "2rem",
    maxWidth: "500px",
    margin: "auto",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
  };

  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    margin: "0.5rem",
    transition: "background-color 0.3s ease"
  };

  const nextButtonStyle = {
    ...buttonStyle,
    backgroundColor: walletAddress ? "#27ae60" : "#cccccc",
    cursor: walletAddress ? "pointer" : "not-allowed"
  };

  const addressDisplayStyle = {
    margin: "1rem 0",
    padding: "0.75rem",
    backgroundColor: "#e8f5e9",
    borderRadius: "4px",
    wordBreak: "break-all",
    fontFamily: "monospace"
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Wallet Connection</h2>
      
      <button 
        onClick={handleConnect}
        style={buttonStyle}
      >
        {walletAddress ? "Change Wallet" : "Connect Wallet"}
      </button>
      
      {walletAddress && (
        <div style={addressDisplayStyle}>
          <p style={{ margin: "0", fontWeight: "bold" }}>Connected:</p>
          <p style={{ margin: "0.5rem 0" }}>{truncateAddress(walletAddress)}</p>
          <p style={{ margin: "0", fontSize: "0.8rem", color: "#666" }}>
            Full address: {walletAddress}
          </p>
        </div>
      )}
      
      <button 
        onClick={handleNext}
        style={nextButtonStyle}
        disabled={!walletAddress}
      >
        Continue to NFT Marketplace
      </button>
      
      {!walletAddress && (
        <p style={{ color: "#e74c3c", marginTop: "1rem", fontSize: "0.9rem" }}>
          Please connect your wallet to continue
        </p>
      )}
    </div>
  );
};

export default WalletButton;