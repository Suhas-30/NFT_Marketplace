// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFT.sol";

contract NftMarketplace is Nft {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) private listings;

    function listNft(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than zero");

        listings[tokenId] = Listing(tokenId, msg.sender, price, true);
    }

    function buyNft(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "NFT not listed");
        require(msg.value >= listing.price, "Insufficient funds");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");

        address seller = listing.seller;
        address creator = getNft(tokenId).creator;
        uint256 price = listing.price;

        uint256 royalty = (price * getRoyalty(tokenId)) / 100;
        uint256 sellerAmount = price - royalty;

        listings[tokenId].isActive = false;

        transferNftInternal(tokenId, seller, msg.sender);

        if (royalty > 0) {
            payable(creator).transfer(royalty);
        }
        payable(seller).transfer(sellerAmount);
    }

    function transferNftInternal(uint256 tokenId, address from, address to) internal {
        require(exists(tokenId), "Token does not exist");
        require(to != address(0), "Cannot transfer to zero address");
        require(from == ownerOf(tokenId), "Not the owner");

        NFT storage nft = nfts[tokenId];
        nft.owner = to;

        balances[from]--;
        balances[to]++;
    }

    function withdrawNft(uint256 tokenId) external {
        require(listings[tokenId].isActive, "NFT not listed");
        require(listings[tokenId].seller == msg.sender, "Not the seller");

        delete listings[tokenId];
    }

    function getAllListings() public view returns (Listing[] memory) {
        uint256 total = tokenIdCounter;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].isActive) {
                count++;
            }
        }

        Listing[] memory activeListings = new Listing[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (listings[i].isActive) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }
}
