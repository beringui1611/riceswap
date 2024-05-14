// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRiceswapRouterV1Orders {

    function createRouterSell(
        address token0, 
        address token1, 
        uint256 min,  
        uint256 quantity, 
        address pool
        ) external;
}