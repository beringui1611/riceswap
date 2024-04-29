// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./libraries/SafeTransfers.sol";
import "./interfaces/IRiceswapV1Errors.sol";

contract RiceswapV1Saler is SafeTransfer, IRiceswapV1Errors{

    address public immutable owner;

    uint256 public immutable range;

    uint16 public immutable price;

    address public immutable token0;

    address public immutable token1;

    mapping(address => uint256) public limitMarking;

    constructor(
    address _owner, 
    uint256 _range, 
    uint16 _price)
    {
        owner = _owner;
        range = _range;
        price = _price;
    }


    function deposit(
        uint256 amount
        ) external {

        if(amount < 0) revert IRiceswapAmount(amount);

        if(limitMarking[token0] > range){
            revert  IRiceswapMaximumRange(amount);
        }

        safeDepositPreSale(token0, amount);
        limitMarking[token0] += amount;
        
    }

    function buy(uint256 amount) external {
        if(amount < 0) revert IRiceswapAmount(amount);

        if(checkRange()){
            
        }

    }


    function checkRange() internal virtual returns(bool){
        if(limitMarking[token0] == 0){
            revert IRiceswapLimitReached(0);
        }

        return true;
    }

}