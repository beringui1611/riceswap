// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "hardhat/console.sol";
contract SafeTransfer {

error RiceswapBalanceInsufficient(uint256 _amount);
error RiceswapAmountInsufficient(uint256 _amount);
error RiceswapAllowanceInsufficient(uint256 _amount);
error RiceswapTransferNotSuccess(bool _success);
error RiceswapTransferNotSuccessPayment(bool _successOne, bool _successTwo);
error RiceswapTransferNotSuccessValidator(bool _success1, bool _success2, bool success3);


function safeTransferFarm(address _token0, uint256 _amount) internal virtual returns(bool){
    IERC20 tkn = IERC20(_token0);

    if(tkn.balanceOf(msg.sender) < _amount) revert RiceswapBalanceInsufficient(_amount);
    if(_amount <= 0) revert RiceswapAmountInsufficient(_amount);
    if(tkn.allowance(msg.sender, address(this)) < _amount) revert RiceswapAllowanceInsufficient(_amount);

    (bool success) = tkn.transferFrom(
        msg.sender, 
        address(this),
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
    address _token1,
    uint256 _monthFee,
    uint256 _dexFee,
    address _dexWallet
    ) internal virtual returns(bool, bool)
    {
        IERC20 tkn = IERC20(_token1);

        if(_monthFee <= 0 || _dexFee <= 0) revert RiceswapAmountInsufficient(0);

        (bool successMonthFee) = tkn.transfer(msg.sender, _monthFee);
        (bool successDexFee) = tkn.transfer(_dexWallet, _dexFee); //colocar endereço da wallet para receber taxas 

        if(!successMonthFee || !successDexFee) revert RiceswapTransferNotSuccessPayment(successMonthFee, successMonthFee);

        return (successMonthFee, successDexFee);
    }


    function safeTransferValidator(
        address _token1, 
        address _from,
        uint256 _monthFee, 
        uint256 _dexFee, 
        uint256 _validatorFee,
        address _dexWallet
        ) internal virtual returns(bool, bool, bool)
        {
            IERC20 tkn = IERC20(_token1);

            if(_monthFee <= 0 || _dexFee <= 0 || _validatorFee <= 0) revert RiceswapAmountInsufficient(0);

            (bool successMonthFee) = tkn.transfer(_from, _monthFee);
            (bool successDexFee) = tkn.transfer(_dexWallet, _dexFee); //colocar endereço da wallet para receber taxas 
            (bool successValidatorFee) = tkn.transfer(msg.sender, _validatorFee);

            if(!successMonthFee || !successDexFee || !successValidatorFee){
                revert RiceswapTransferNotSuccessValidator(successMonthFee, successMonthFee, successValidatorFee);
            } 

            return (successMonthFee, successDexFee, successValidatorFee);
        }



    function safeTransferDeposit(
        address _token1,
        uint256 _amount
        ) internal virtual returns(bool) 
        {
            IERC20 tkn = IERC20(_token1);
            if(_amount <= 0) revert RiceswapAmountInsufficient(0);
            if(tkn.balanceOf(msg.sender) < _amount) revert RiceswapBalanceInsufficient(_amount);
            if(tkn.allowance(msg.sender, address(this)) < _amount) revert RiceswapAllowanceInsufficient(_amount);

            (bool success) = tkn.transferFrom(msg.sender, address(this), _amount);

            if(!success){
                revert RiceswapTransferNotSuccess(success);
            }
            
            return success;
        }

}