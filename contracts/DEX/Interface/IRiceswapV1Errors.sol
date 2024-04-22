// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface IRiceswapV1Errors {

    error IRiceswapAddressZero(address _pool);

    error IRiceswapTimeInvalid(uint256 _timer);

    error IRiceswapPercentInvalid(uint16 _percent);

    error IRiceswapIndexInvalid(uint64 _index);

    error IRiceswapAddressDifferentToken0(address _token0);

    error IRiceswapTimeNotExpired(uint256 timestamp);

    error IRiceswapInsufficientFarming(uint256 _amount);

    error IRiceswapLiquidityInsufficient(uint256 _liquidity);

}