// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IAgreggatorInterface.sol";
import "hardhat/console.sol";

contract RiceswapRouterV1Orders {

    address public ETH;
    address public BTC;
    address public USDT;
    address public SOL;
    address public BNB;
    address public USDC;

    constructor(
        address _eth, 
        address _btc, 
        address _usdt, 
        address _sol, 
        address _bnb, 
        address _usdc)
        {
            ETH = _eth;
            BTC = _btc;
            USDT = _usdt;
            SOL = _sol;
            BNB = _bnb;
            USDC = _usdc;
        }
   
    struct Sell {
        address pool;
        address owner;
        address token0;
        address token1;
        int128 min;
        uint256 quantity;
    }

    struct OrdersSells {
      Sell[] sell;
    }

    mapping(bytes32 => OrdersSells) orders;

    function createRouterSell(
        address token0, 
        address token1, 
        uint256 min,  
        uint256 quantity, 
        address pool
        ) external {
        require(token0 != address(0), "Invalid token0 address");
        require(token1 != address(0), "Invalid token1 address");
        require(token0 != token1, "token0 and token1 must be different");
        require(min > 0, "min must be greater than zero");
        require(quantity > 0, "quantity must be greater than zero");

         bytes32 hsh = keccak256(abi.encode(token0, token1));
         
         Sell memory params = Sell({pool: pool, owner: msg.sender, token0: token0, token1: token1, min: min, quantity:quantity});

         orders[hsh].sell.push(params);

        
    }

    function routerSell(address token0, address token1) external view returns(OrdersSells memory) {
        bytes32 hsh = keccak256(abi.encode(token0, token1));
        return orders[hsh];
    }
}
    

/*
--> factory 
    --> price coins 
            | sustentability the smart contracts 
            | sc -> presale
            | sc -> orders

        --> presale contract 
            (necessity prices in real time for functions sell tokens in presale )
        and 
        --> router orders updates and poast infos
        --> orders contract 
            (necessity prices in real time for functions buy and sell )
     
*/