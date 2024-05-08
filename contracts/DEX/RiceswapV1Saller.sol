// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./libraries/SafeTransfers.sol";
import "./interfaces/IRiceswapV1Errors.sol";
import "./interfaces/IRiceswapV1Factory.sol";
import "./libraries/SecurityCalls.sol";

contract RiceswapV1Saller is SafeTransfer, IRiceswapV1Errors, SecurityCall{

    address public immutable owner;

    uint256 public immutable range;

    uint16 public immutable price;

    address public immutable token0;

    address public immutable token1;

    address public immutable factory;

    address public immutable dexWallet;

    bool public estimateRange;

    mapping(address => uint256) public limitMarking;
    mapping(address => uint256) public _claim;

    constructor(
    address _owner, 
    uint256 _range, 
    uint16 _price,
    address _token0,
    address _token1,
    address _factory,
    address _dexWallet
    )
    {
        owner = _owner;
        range = _range;
        price = _price;
        token0 = _token0;
        token1 = _token1;
        factory = _factory;
        dexWallet = _dexWallet;
    }


    function deposit(
        uint256 amount
        ) external {

        if(amount <= 0) revert IRiceswapAmount(amount);

        if(limitMarking[token0] > range){
            revert IRiceswapMaximumRange(amount);
        }
        else if(amount > range){
            revert IRiceswapMaximumRange(amount);
        }
        

        safeDepositPreSale(token0, amount);
        limitMarking[token0] += amount;
        
    }

    function withdraw() external {
        require(msg.sender == owner, "O");
        if(!estimateRange) revert IRiceswapPreSaleNotFinished(false);

        safeTransferWithdraw(token1, owner, dexWallet, dexFee());
        
    }

    function buy(address _msgSender, uint256 amount) external lockPreSale noDelegatePresale(_msgSender){
        if(amount <= 0) revert IRiceswapAmount(amount);

        if(!checkRange()){
            revert IRiceswapErrorBuy(0);
        }
               
        uint256 value = amount * price;

        finished(amount);
        safeTransferBuy(token1, value);
        limitMarking[token0] -= amount;
        _claim[_msgSender] += amount;
      
    }

    function refund(address _msgSender, uint256 amount) external lockPreSale noDelegatePresale(_msgSender) {
        if(amount <= 0) revert IRiceswapAmount(amount);
        if(_claim[_msgSender] < amount) revert IRiceswapInvalidRefund(amount);

        uint256 value = amount * price;

        safeTransferRefund(_msgSender, token1, value);
        _claim[_msgSender] -= amount;
        limitMarking[token0] += amount;
    }

    function claim(address _msgSender) external noDelegatePresale(_msgSender) {
        if(!estimateRange) revert IRiceswapPreSaleNotFinished(false);

        if(_claim[_msgSender] > 0){
            (uint256 totalClaim) = getClaim(_msgSender);
            safeTransferClaim(_msgSender, token0, totalClaim);
        }
        else
        {
            revert IRiceswapBalanceClaimInvalid(0);
        }
        
    }

    function getClaim(address _msgSender) public virtual view returns(uint256){
        return _claim[_msgSender];
    }

    function checkRange() internal virtual returns(bool){
        if(limitMarking[token0] == 0){
            revert IRiceswapLimitReached(0);
        }

        return true;
    }

    function finished(uint256 amount) internal virtual {
        if(limitMarking[token0] - amount == 0){
            estimateRange = true;       
        }
    }

    function isFinished() internal virtual returns(bool) {
        return estimateRange;
    }

    modifier lockPreSale() {
        if(isFinished()){
            revert IRiceswapPreSaleFinished(true);
        }
        _;
    }

    function dexFee() internal virtual returns(uint16) {
        return IRiceswapV1Factory(factory).getFee();
    }

}