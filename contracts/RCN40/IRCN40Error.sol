// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRCN40Errors {

    error RCN40InsufficientBalance(uint256 amount);

    error RCN40Amount(uint amount);

    error RCN40Approve(bool approved);

    error RCN40TimeNotExpired(uint256 time);

    error RCN40InsufficientFarming(uint amount);

    error RCN40AddressZero(address zero);

    error RCN40InitializeAddress(address _tokenAddress, address _tokenBacked);

    error RCN40NotFarmingTokens(uint256 amount);

}