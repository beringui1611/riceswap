// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;



interface IRiceSwapErrors {

    error IRCNPoolAlreadyExist(address _pool);

    error IRCNAmount(uint256 _amount);

    error IRCNAddressZero(address _tokenAddress, address _tokenPair);

    error IRCNTokenNotTransfer(bool _success);

    error IRCNBalanceOfInsufficient(uint256 _amount);

    error IRCNNotApprove(bool _isApprove);

    error IRCNProtocolNotExist(address _token0);

    error IRCNTimeNotExpired(uint _time);

    error IRCNInsufficientFarming(uint _amount);

    error IRCNInsufficientLiquidity(uint _liquidity);

}