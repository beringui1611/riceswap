// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract RiceswapV1Orders {

   

    struct Sell {
        address pool;
        address owner;
        address token0;
        address token1;
        int128 min;
        uint256 quantity;
    }

    struct Buy {
        address token0;
        address token1;
        int128 max;
        uint256 quantity;
    }

    struct OrdersSells {
      Sell[] sell;
    }

    mapping(bytes32 => OrdersSells) orders;

   function orderSell(address token0, address token1, int128 min, int128 max, uint256 quantity) external {
        require(token0 != address(0), "Invalid token0 address");
        require(token1 != address(0), "Invalid token1 address");
        require(token0 != token1, "token0 and token1 must be different");
        require(min > 0, "min must be greater than zero");
        require(max > 0, "max must be greater than zero");
        require(quantity > 0, "quantity must be greater than zero");

         bytes32 hsh = keccak256(abi.encode(token0, token1));
         address pool; //criar o deployer de pools de ordens e criar pools de ordens
         Sell memory params = Sell({pool: pool, owner: msg.sender, token0: token0, token1: token1, min: min, quantity:quantity});

         orders[hsh].sell.push(params);

        
    }

    function getOrders(address token0, address token1) external view returns(OrdersSells memory) {
        bytes32 hsh = keccak256(abi.encode(token0, token1));
        return orders[hsh];
    }
}
    
