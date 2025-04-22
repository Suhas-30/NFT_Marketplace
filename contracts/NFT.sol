// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Nft {
    struct NFT {
        uint256 id;
        address creator;
        address owner;
        string tokenURI;
        uint256 royaltyPercentage;
    }

    mapping(uint256 => NFT) internal nfts;
    mapping(address => uint256) internal balances;
    uint256 internal tokenIdCounter;

    string private name;
    string private description;
    bool private collectionInitialized;

    function mintNft(
        string memory uri,
        uint256 royaltyPercentage,
        string memory collectionName,
        string memory collectionDescription
    ) external {
        require(royaltyPercentage <= 10, "Royalty too high!");

        if (!collectionInitialized) {
            name = collectionName;
            description = collectionDescription;
            collectionInitialized = true;
        }

        tokenIdCounter++;
        uint256 newTokenId = tokenIdCounter;

        nfts[newTokenId] = NFT({
            id: newTokenId,
            creator: msg.sender,
            owner: msg.sender,
            tokenURI: uri,
            royaltyPercentage: royaltyPercentage
        });

        balances[msg.sender]++;
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

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(exists(tokenId), "Token does not exist");
        return nfts[tokenId].owner;
    }

    function getNft(uint256 tokenId) public view returns (NFT memory) {
        require(exists(tokenId), "Token does not exist");
        return nfts[tokenId];
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

    function exists(uint256 tokenId) internal view returns (bool) {
        return nfts[tokenId].owner != address(0);
    }
}
