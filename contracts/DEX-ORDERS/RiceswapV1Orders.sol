// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IRiceswapV1Errors.sol";
import "../libraries/SafeTransfers.sol";
import "../interfaces/IRiceswapRouterV1Orders.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RiceswapV1Orders is IRiceswapV1Errors, SafeTransfer{

    address public owner;
    address public immutable dexWallet;
    address public immutable router;

     struct Sell {
        address owner;
        address token0;
        address token1;
        uint256 min;
        uint256 quantity;
    }

    mapping(bytes32 => Sell) seles;

    function sell(address token0, address token1, uint256 min, uint256 quantity) external {
       
        if(address(token0) == address(0)) revert IRiceswapAddressZero(token0);
        if(address(token1) == address(0)) revert IRiceswapAddressZero(token1);
        if(min <= 0)                      revert IRiceswapInvalidMinAmount(min);
        if(quantity <= 0)                 revert IRiceswapInvalidQuantity(quantity);

       safeTransferSell(token0, quantity);
       
       IRiceswapRouterV1Orders(router)
       .createRouterSell(
        token0, 
        token1, 
        min, 
        quantity, 
        address(this)
        );

        Sell memory params = Sell({ owner: msg.sender, token0: token0, token1: token1, min: min, quantity: quantity});
        bytes32 hsh = keccak256(abi.encode(token0, token1));

        seles[hsh] = params;
    }

}