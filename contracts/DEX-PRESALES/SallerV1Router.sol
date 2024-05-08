// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IRiceswapV1Saller.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SallerV1Router {

    error RiceswapInvalidAddress(address zero);

    error RiceswapInvalidAmount(uint256 amount);

    event Deposit(address indexed presale, address indexed msgSender, uint256 amount);
    event Buy(address indexed presale, address indexed msgSender, uint256 amount);
    event Refund(address indexed presale, address indexed msgSender, uint256 amount);
    event Claim(address indexed presale, address indexed msgSender);



    function callbackDeposit(address presale, uint256 amount) external {
        IRiceswapV1Saller sspresale = IRiceswapV1Saller(presale);
        IERC20 tkn = IERC20(sspresale.token0());

        if(address(presale) == address(0)) revert RiceswapInvalidAddress(presale);
        if(amount <= 0) revert  RiceswapInvalidAmount(amount);
        
        tkn.transferFrom(msg.sender, address(this), amount);

        tkn.approve(presale, amount);

        sspresale.deposit(amount);

        emit Deposit(presale, msg.sender, amount);
    }

    function callbackBuy(address presale, uint256 amount) external {
        IRiceswapV1Saller sspresale = IRiceswapV1Saller(presale);
        IERC20 tkn = IERC20(sspresale.token1());

        if(address(presale) == address(0)) revert RiceswapInvalidAddress(presale);
        if(amount <= 0) revert  RiceswapInvalidAmount(amount);

        tkn.transferFrom(msg.sender, address(this), amount);
        tkn.approve(presale, amount);

        sspresale.buy(msg.sender, amount);

        emit Buy(presale, msg.sender, amount);
    }

    function callbackRefund(address presale, uint256 amount) external {
        IRiceswapV1Saller sspresale = IRiceswapV1Saller(presale);

        if(address(presale) == address(0)) revert RiceswapInvalidAddress(presale);
        if(amount <= 0) revert  RiceswapInvalidAmount(amount);

        sspresale.refund(msg.sender, amount);

        emit Refund(presale, msg.sender, amount);
    }

    function callbackClaim(address presale) external {
        IRiceswapV1Saller sspresale = IRiceswapV1Saller(presale);

        if(address(presale) == address(0)) revert RiceswapInvalidAddress(presale);
    
        sspresale.claim(msg.sender);

        emit Claim(presale, msg.sender);
    }

    function RouterV1() external virtual pure returns(bool){
        return true;
    }

}