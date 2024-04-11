// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract RiceSkr is ERC721, ERC721Enumerable, ERC721URIStorage{

    uint private _tokenIdCounter;
    address owner;
    
    constructor() ERC721("RiceCoin SKR ", "RCN") {
        owner = msg.sender;
    }

    function mint() public onlyOwner {
        require(_tokenIdCounter < 1, "skr already exist");
        uint256 tokenId = ++_tokenIdCounter;

        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, Strings.toString(tokenId));
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return string.concat(super.tokenURI(tokenId), ".json");
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://www.luiztools.com.br/nfts/";
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "you do not permission");
        _;
    }

}