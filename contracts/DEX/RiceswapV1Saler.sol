// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./libraries/SafeTransfers.sol";
import "./interfaces/IRiceswapV1Errors.sol";
import "./interfaces/IRiceswapV1Factory.sol";

contract RiceswapV1Saler is SafeTransfer, IRiceswapV1Errors{

    address public immutable owner;

    uint256 public immutable range;

    uint16 public immutable price;

    address public immutable token0;

    address public immutable token1;

    address public immutable factory;

    bool public estimateRange;

    mapping(address => uint256) public limitMarking;
    mapping(address => uint256) public _claim;

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

    function withdraw() external {
        require(msg.sender == owner, "O");
        if(!estimateRange) revert IRiceswapPreSaleNotFinished(false);

        safeTransferWithdraw(token1, owner, factory, dexFee());
        
    }

    function buy(uint256 amount) external lockPreSale {
        if(amount <= 0) revert IRiceswapAmount(amount);

        if(!checkRange()){
            revert IRiceswapErrorBuy(0);
        } 
        
        uint256 value = amount * price;

        safeTransferBuy(token1, value);
        limitMarking[token0] -= amount;
        _claim[msg.sender] += amount;
      
    }

    function refund(uint256 amount) external lockPreSale {
        if(amount <= 0) revert IRiceswapAmount(amount);
        if(_claim[msg.sender] < amount) revert IRiceswapInvalidRefund(amount);

        uint256 value = amount * price;

        safeTransferRefund(token0, token1, amount, value);
        _claim[msg.sender] -= amount;
        limitMarking[token0] += amount;
    }

    function claim() external {
        if(!estimateRange) revert IRiceswapPreSaleNotFinished(false);

        if(_claim[msg.sender] > 0){
            (uint256 totalClaim) = getClaim();
            safeTransferClaim(token0, totalClaim);
        }
        
    }

    function getClaim() public virtual view returns(uint256){
        return _claim[msg.sender];
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