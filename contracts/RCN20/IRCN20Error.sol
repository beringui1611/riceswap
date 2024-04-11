// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRCN20Errors {

    error RCN20InsufficientBalance(uint256 amount);

    error RCN20Amount(uint amount);

    error RCN20Approve(bool approved);

    error RCN20TimeNotExpired(uint256 time);

    error RCN20InsufficientFarming(uint amount);

    error RCN20AddressZero(address zero);

    error RCN20InitializeAddress(address _tokenAddress, address _tokenBacked);

    error RCN20NotFarmingTokens(uint256 amount);

}