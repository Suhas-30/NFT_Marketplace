// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFT.sol";

contract NFTMarketplace is CustomNFT {
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) private listings;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Sold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event Withdrawn(uint256 indexed tokenId, address indexed seller);

    function listNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        listings[tokenId] = Listing(tokenId, msg.sender, price, true);
        emit Listed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "NFT not listed");
        require(msg.value >= listing.price, "Insufficient funds");

        uint256 royalty = (listing.price * getRoyalty(tokenId)) / 100;
        uint256 sellerAmount = listing.price - royalty;

        payable(getNFT(tokenId).creator).transfer(royalty);
        payable(listing.seller).transfer(sellerAmount);

        transferNFT(tokenId, msg.sender);
        listings[tokenId].isActive = false;

        emit Sold(tokenId, msg.sender, listing.price);
    }

    function withdrawNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        delete listings[tokenId];
        emit Withdrawn(tokenId, msg.sender);
    }

    function getAllListings() public view returns (Listing[] memory) {
        uint256 total = _tokenIdCounter;
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
