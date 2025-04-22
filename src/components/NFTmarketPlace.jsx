import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Button from "../components/Button";

const NFTmarketPlace = () => {
  const navigate = useNavigate();
  const { currentAccount } = useWallet();

  const handleMintSubmit = (e) => {
    e.preventDefault();
    navigate('/mint-nft-art');
  };

  const handleListings = (e) => {
    e.preventDefault();
    navigate('/listings');
  };

  const handleList = (e) => {
    e.preventDefault();
    navigate('/list');
  };

  const handleBuy = (e) => {
    e.preventDefault();
    navigate('/buy');
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    navigate('/withdraw');
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    navigate('/transfer');
  };

  const containerStyle = {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center"
  };

  const headerStyle = {
    color: "#2c3e50",
    marginBottom: "1.5rem",
    fontSize: "2rem"
  };

  const walletInfoStyle = {
    padding: "0.75rem",
    backgroundColor: "#e8f5e9",
    borderRadius: "4px",
    marginBottom: "2rem",
    fontFamily: "monospace",
    wordBreak: "break-all",
    display: "inline-block",
    minWidth: "50%"
  };

  const buttonsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1.5rem"
  };

  const noWalletStyle = {
    color: "#e74c3c",
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fdedec",
    borderRadius: "4px",
    fontWeight: "bold"
  };

  const truncateAddress = (address) => {
    if (!address) return "Not Connected";
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>NFT Marketplace</h1>
      
      <div style={walletInfoStyle}>
        <p style={{ margin: "0", fontWeight: "bold" }}>Connected Wallet:</p>
        <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>
          {currentAccount ? truncateAddress(currentAccount) : "Not Connected"}
        </p>
      </div>

      {!currentAccount && (
        <div style={noWalletStyle}>
          Please connect your wallet to access all marketplace features
        </div>
      )}
      
      <div style={buttonsContainerStyle}>
        <Button 
          type="button" 
          name="Mint NFT" 
          onClick={handleMintSubmit} 
          disabled={!currentAccount}
        />
        <Button 
          type="button" 
          name="View Listings" 
          onClick={handleListings}
        />
        <Button 
          type="button" 
          name="List NFT" 
          onClick={handleList} 
          disabled={!currentAccount}
        />
        <Button 
          type="button" 
          name="Buy NFT" 
          onClick={handleBuy} 
          disabled={!currentAccount}
        />
        <Button 
          type="button" 
          name="Withdraw NFT" 
          onClick={handleWithdraw} 
          disabled={!currentAccount}
        />
        <Button 
          type="button" 
          name="Transfer NFT" 
          onClick={handleTransfer} 
          disabled={!currentAccount}
        />
      </div>
    </div>
  );
};

export default NFTmarketPlace;