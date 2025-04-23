// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Nft {
    struct NFT {
        uint256 id;
        address creator;
        address owner;
        string tokenURI;
        uint256 royaltyPercentage;
        string name;
        string description;
    }

    mapping(uint256 => NFT) internal nfts;
    mapping(address => uint256) internal balances;
    uint256 internal tokenIdCounter;

    function mintNft(string memory uri, uint256 royaltyPercentage, string memory nftName,string memory nftDescription) external {
        require(royaltyPercentage <= 10, "Royalty too high!");

        tokenIdCounter++;
        uint256 newTokenId = tokenIdCounter;

        nfts[newTokenId] = NFT({
            id: newTokenId,
            creator: msg.sender,
            owner: msg.sender,
            tokenURI: uri,
            royaltyPercentage: royaltyPercentage,
            name: nftName,
            description: nftDescription
        });

        balances[msg.sender]++;
    }

    function exists(uint256 tokenId) internal view returns (bool) {
        return nfts[tokenId].owner != address(0);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(exists(tokenId), "Token does not exist");
        return nfts[tokenId].owner;
    }

    function getNft(uint256 tokenId) public view returns (NFT memory) {
        require(exists(tokenId), "Token does not exist");
        return nfts[tokenId];
    }

    function transferNft(uint256 tokenId, address to) public {
        require(exists(tokenId), "Token does not exist");
        require(to != address(0), "Invalid address");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        address currentOwner = nfts[tokenId].owner;
        nfts[tokenId].owner = to;
        balances[currentOwner]--;
        balances[to]++;
    }

    

    function getRoyalty(uint256 tokenId) public view returns (uint256) {
        require(exists(tokenId), "Token does not exist");
        return nfts[tokenId].royaltyPercentage;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Zero address not allowed");
        return balances[owner];
    }

    function tokenUri(uint256 tokenId) external view returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        return nfts[tokenId].tokenURI;
    }

    
}
