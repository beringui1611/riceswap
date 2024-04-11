// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RiceCoin is ERC20{

    address owner;
    address skr;


    constructor()ERC20("RiceCoin", "RCN"){
        _mint(msg.sender, 1_360_450_000 *10 **decimals());
        owner = msg.sender;
    }


    function burn(uint256 amount) external onlyOnwer{
        _burn(_msgSender(), amount);
    }
   

    function decimals() public override pure returns(uint8){
        return 18;
    }


    function addSkr(address _nft)external onlyOnwer{
        skr = _nft;
    }


    function skrOriginal() external view returns(address){
        return skr;
    }


    modifier onlyOnwer() {
        require(msg.sender == owner, "you do not permission");
        _;
    }

    
}