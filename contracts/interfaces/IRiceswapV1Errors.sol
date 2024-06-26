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

    error IRiceswapAmount(uint256 _amount);

    error IRiceswapMaximumRange(uint256 _amount);

    error IRiceswapLimitReached(uint256 _limit);

    error IRiceswapErrorBuy(uint256 _amount);

    error IRiceswapInvalidRefund(uint256 _amount);

    error IRiceswapPreSaleFinished(bool _finished);

    error IRiceswapPreSaleNotFinished(bool _finished);

    error IRiceswapBalanceClaimInvalid(uint256 _claim);

    error IRiceswapRangeInvalid(uint256 _range);

    error IRiceswapInvalidPrice(uint256 _range);

   error IRiceswapInvalidMinAmount(uint256 _min);

   error IRiceswapInvalidQuantity(uint256 _quantity);

}