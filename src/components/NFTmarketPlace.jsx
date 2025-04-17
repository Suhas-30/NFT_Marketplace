import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Button from "../components/Button";

const NFTmarketPlace = () => {
  const navigate = useNavigate(); // ✅ move this here
  const { currentAccount } = useWallet();

  const handleMintSubmit = (e) => {
    e.preventDefault(); // ✅ small typo fixed here too
    navigate('/mint-nft-art');
  };

  const handleListings = (e)=>{
    e.preventDefault();
    navigate('/listings');
  }

  const handleList = (e)=>{
    e.preventDefault();
    navigate('/list');
  }

  const handleBuy = (e)=>{
    e.preventDefault();
    navigate('/buy');
  }

  const handleWithdraw = (e)=>{
    e.preventDefault();
    navigate('/withdraw');
  }

  const handleTransfer = (e)=>{
    e.preventDefault();
    navigate('/transfer');
  }



  return (
    <>
      <h1>This is NFT market place</h1>
      <p>Wallet: {currentAccount}</p>

      <Button type="button" name="Mint" onClick={handleMintSubmit} />
      <Button type="button" name="Listings" onClick={handleListings}/>
      <Button type="button" name="List" onClick={handleList}/>
      <Button type="button" name="Buy" onClick={handleBuy}/>
      <Button type="button" name="Withdraw" onClick={handleWithdraw}/>
      
    </>
  );
};

export default NFTmarketPlace;
