// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IRiceswapV1Errors.sol";
import "./interfaces/IRiceswap20V1Pool.sol";
import "./interfaces/IRiceswap40V1Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract RiceswapV1Router is IRiceswapV1Errors{
    
    function callbackFarm(
        address pool,
        uint256 amount
        ) external returns(bool){
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);
            IERC20 tkn = IERC20(sspool.token0());

            if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
            if(amount <= 0) revert IRiceswapAmount(amount);

            tkn.transferFrom(msg.sender, address(this), amount);
            tkn.approve(pool, amount);

            sspool.farm(msg.sender, amount);

            return true;
    }

    function callbackRemoveFarm(
        address pool, 
        uint256 amount)
         external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);

           if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
            if(amount <= 0) revert IRiceswapAmount(amount);

            sspool.removeFarm(msg.sender, amount);

            return true;
    }

    function callbackPayholders(
        address pool) 
         external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);

           if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);

            sspool.payholders(msg.sender);

            return true;
    }

    function callbackValidator(
        address pool, 
        address from) 
         external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);

           if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
           if(from == address(0)) revert IRiceswapAddressZero(from);

            sspool.validator(from, msg.sender);

            return true;
    }

    function callbackDeposit(
        address pool, 
        uint256 amount) 
          external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);
            IERC20 tkn = IERC20(sspool.token1());

            if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
            if(amount <= 0) revert IRiceswapAmount(amount);

            tkn.transferFrom(msg.sender, address(this), amount);
            tkn.approve(pool, amount);

            sspool.deposit(amount);

            return true;
    }
}

