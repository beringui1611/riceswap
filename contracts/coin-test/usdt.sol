// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Usdt is ERC20{

    address owner;
    address skr;


    constructor()ERC20("Theater", "USDT"){
        _mint(msg.sender, 1_360_450_000 *10 **decimals());
        owner = msg.sender;
    }

    function skrOriginal() external view returns(address){
        return skr;
    }

}