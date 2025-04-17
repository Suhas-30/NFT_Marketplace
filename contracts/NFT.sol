// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CustomNFT {
    struct NFT {
        uint256 id;
        address creator;
        address owner;
        string tokenURI;
        uint256 royaltyPercentage;
    }

    mapping(uint256 => NFT) private _nfts;
    mapping(address => uint256) private _balances;
    uint256 internal _tokenIdCounter;

    string private _name;
    string private _description;
    bool private _collectionInitialized;

    event Minted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event Transferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event CollectionInitialized(string name, string description);

    function mintNFT(
        string memory _tokenURI,
        uint256 _royaltyPercentage,
        string memory name_,
        string memory description_
    ) external {
        require(_royaltyPercentage <= 10, "Royalty too high!");

        if (!_collectionInitialized) {
            _name = name_;
            _description = description_;
            _collectionInitialized = true;
            emit CollectionInitialized(name_, description_);
        }

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _nfts[newTokenId] = NFT({
            id: newTokenId,
            creator: msg.sender,
            owner: msg.sender,
            tokenURI: _tokenURI,
            royaltyPercentage: _royaltyPercentage
        });

        _balances[msg.sender]++;
        emit Minted(newTokenId, msg.sender, _tokenURI);
    }

    function transferNFT(uint256 tokenId, address to) public {
        require(_nfts[tokenId].owner == msg.sender, "Not the owner");
        require(to != address(0), "Invalid address");

        address previousOwner = _nfts[tokenId].owner;
        _nfts[tokenId].owner = to;

        _balances[previousOwner]--;
        _balances[to]++;
        emit Transferred(tokenId, previousOwner, to);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return _nfts[tokenId].owner;
    }

    function getNFT(uint256 tokenId) public view returns (NFT memory) {
        require(_exists(tokenId), "Token does not exist");
        return _nfts[tokenId];
    }

    function getRoyalty(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _nfts[tokenId].royaltyPercentage;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Zero address not allowed");
        return _balances[owner];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _nfts[tokenId].tokenURI;
    }


    function _exists(uint256 tokenId) internal view returns (bool) {
        return _nfts[tokenId].owner != address(0);
    }
}
