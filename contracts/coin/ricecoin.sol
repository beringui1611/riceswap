// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract RiceCoin is ERC20{
  

    address owner;

     

    constructor()ERC20("RiceCoin", "RCN"){
        _mint(msg.sender, 1_360_450_000 *10 **decimals());
        owner = msg.sender;
    }
    
}