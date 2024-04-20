// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract SafeTransfer {

error RiceswapBalanceInsufficient(uint256 _amount);
error RiceswapAmountInsufficient(uint256 _amount);
error RiceswapAllowanceInsufficient(uint256 _amount);
error RiceswapTransferNotSuccess(bool _success);

function safeTransferFarm(address _token0, uint256 _amount, address _to) internal virtual returns(bool){
    IERC20 tkn = IERC20(_token0);

    if(tkn.balanceOf(msg.sender) < _amount) revert RiceswapBalanceInsufficient(_amount);
    if(_amount <= 0) revert RiceswapAmountInsufficient(_amount);
    if(tkn.allowance(msg.sender, _to) < _amount) revert RiceswapAllowanceInsufficient(_amount);

    (bool success) = tkn.transferFrom(
        msg.sender, 
        _to, 
        _amount
    );

    if(!success){
        revert RiceswapTransferNotSuccess(success);
    }

    return success;

}


function safeTransferRemoveFarm(address _token0, uint256 _amount) internal virtual returns(bool){
    IERC20 tkn = IERC20(_token0);

    if(_amount <= 0) revert RiceswapAmountInsufficient(_amount);

    (bool success) = tkn.transfer(msg.sender, _amount);

    if(!success) {
       revert RiceswapTransferNotSuccess(success);
    }

    return success;
}


function safeTransferPayment(
    address _token0,
    uint256 _monthFee, 
    uint256 _dexFee
    ) internal virtual returns(bool)
    {
        IERC20 tkn = IERC20(_token0);

        if(_monthFee <= 0 || _dexFee <= 0) revert RiceswapAmountInsufficient(0);

        (bool successMonthFee) = tkn.transfer(msg.sender, _monthFee);
        (bool successDexFee) = tkn.transfer()
    }

}