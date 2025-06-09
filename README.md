# NFT Marketplace Project

  

## 🚀 Features
- **Mint NFTs:** Anyone can mint a new NFT by providing metadata and royalty percentage (up to 10%).
- **List NFTs:** After minting, NFTs can be listed for sale on the marketplace.
- **Buy NFTs:** Users can purchase listed NFTs, and the original creator will receive royalties on each sale.
- **Transfer NFTs:** NFT owners can directly transfer their NFTs to another wallet.
- **Withdraw NFTs:** Sellers can remove (withdraw) their NFTs from the marketplace listings.
- **Royalties System:** Creators receive a royalty (max 10%) every time the NFT is resold.

## 🛠️ Getting Started

Clone the repository:
```bash
git clone https://github.com/Suhas-30/NFT_Marketplace.git
cd NFT_Marketplace

npm install
npm install dotenv


Setup the dotenv file 

VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_GATEWAY=your_pinata_gateway_url
VITE_PINATA_JWT_KEY=your_pinata_jwt_key

npm run dev
