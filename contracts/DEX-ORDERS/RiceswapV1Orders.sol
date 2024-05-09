// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract RiceswapV1Orders {

    address public owner;
    address public immutable dexWallet;
    address public immutable factory;

    mapping(address => uint256) coins;

    constructor(
        address _eth, 
        address _btc, 
        address _usdt, 
        address _sol, 
        address _bnb, 
        address _usdc,
        )
        {
            coins[_eth]= ;
            BTC = _btc;
            USDT = _usdt;
            SOL = _sol;
            BNB = _bnb;
            USDC = _usdc;
        }




    
}