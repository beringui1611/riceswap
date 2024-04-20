// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract PercentPerTotal {

    function example() 
    external 
    view
    returns(uint256)
    {
        uint256 percentFee = 680000 / 6800000 * 100;
        uint256 reward = percentFee * 6800000 / 100;

        return reward;

       
        
    }
}

