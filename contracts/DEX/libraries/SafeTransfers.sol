// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract SafeTransfer {

/**
 * @dev Unauthorized transactions 
 */
error RiceswapBalanceInsufficient(uint256 _amount);
error RiceswapAmountInsufficient(uint256 _amount);
error RiceswapAllowanceInsufficient(uint256 _amount);
error RiceswapTransferNotSuccess(bool _success);
error RiceswapTransferNotSuccessPayment(bool _successOne, bool _successTwo);
error RiceswapTransferNotSuccessValidator(bool _success1, bool _success2, bool success3);


/**
 * @dev Transaction to deposit your tokens into farm, here all validation
 * of amount and user balance checks occur, then we perform a transferFrom
 * to this contract, the return should be success.
 */

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


/**
* @dev Withdrawal transaction, performs the inverse logic of farm, sending back
* the chosen amount by the user according to their balance.
*/

function safeTransferRemoveFarm(address _token0, uint256 _amount, address _msgSender) internal virtual returns(bool){
    IERC20 tkn = IERC20(_token0);

    if(_amount <= 0) revert RiceswapAmountInsufficient(_amount);

    (bool success) = tkn.transfer(_msgSender, _amount);

    if(!success) {
       revert RiceswapTransferNotSuccess(success);
    }

    return success;
}


/**
* @dev Payment transaction, pays the (users) and fees to the (dex) in the same transaction.
* The calculation is done in the ../libraries/Math.sol library.
*/

function safeTransferPayment(
    address _token1,
    uint256 _monthFee,
    uint256 _dexFee,
    address _dexWallet,
    address _msgSender
    ) internal virtual returns(bool, bool)
    {
        IERC20 tkn = IERC20(_token1);

        if(_monthFee <= 0 || _dexFee <= 0) revert RiceswapAmountInsufficient(0);

        (bool successMonthFee) = tkn.transfer(_msgSender, _monthFee);
        (bool successDexFee) = tkn.transfer(_dexWallet, _dexFee); //colocar endereço da wallet para receber taxas 

        if(!successMonthFee || !successDexFee) revert RiceswapTransferNotSuccessPayment(successMonthFee, successMonthFee);

        return (successMonthFee, successDexFee);
    }

    
    /**
    * @dev Validation transfer, makes the payment to the (validator, user, dex),
    * the fee calculation for validator, DEX, and user is done in ../libraries/Math.sol
    * we receive all the addresses and values already set to simply transfer in a
    * safe and validated manner.
    */

    function safeTransferValidator(
        address _token1, 
        address _from,
        uint256 _monthFee, 
        uint256 _dexFee, 
        uint256 _validatorFee,
        address _dexWallet, 
        address _msgSender
        ) internal virtual returns(bool, bool, bool)
        {
            IERC20 tkn = IERC20(_token1);

            if(_monthFee <= 0 || _dexFee <= 0 || _validatorFee <= 0) revert RiceswapAmountInsufficient(0);

            (bool successMonthFee) = tkn.transfer(_from, _monthFee);
            (bool successDexFee) = tkn.transfer(_dexWallet, _dexFee); //colocar endereço da wallet para receber taxas 
            (bool successValidatorFee) = tkn.transfer(_msgSender, _validatorFee);

            if(!successMonthFee || !successDexFee || !successValidatorFee){
                revert RiceswapTransferNotSuccessValidator(successMonthFee, successMonthFee, successValidatorFee);
            } 

            return (successMonthFee, successDexFee, successValidatorFee);
        }

    
    /**
    * @dev owner function --> the owner deposits the monthly payment liquidity here,
    * where it is saved in the pool address allowing for the correct split for each user.
    */
   
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


    function safeDepositPreSale(
        address token0, 
        uint256 amount
        ) internal virtual returns(bool){
            IERC20 tkn = IERC20(token0);

            if(amount <= 0) revert RiceswapAmountInsufficient(0);
            if(tkn.balanceOf(msg.sender) < amount) revert RiceswapBalanceInsufficient(amount);
            if(tkn.allowance(msg.sender, address(this)) < amount) revert RiceswapAllowanceInsufficient(amount);

            (bool success) = tkn.transferFrom(msg.sender, address(this), amount);

            if(!success){
                revert RiceswapTransferNotSuccess(success);
            }

            return success;
    }

}