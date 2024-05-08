// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRiceswapV1Router {

     function callbackFarm(
        address pool,
        uint256 amount
        ) external returns(bool);

    function callbackRemoveFarm(
        address pool, 
        uint256 amount
        ) external returns(bool);

    function callbackPayholders(
        address pool
        ) external returns(bool);

    function callbackValidator(
        address pool, 
        address from
        ) external returns(bool);

    function callbackDeposit(
        address pool, 
        uint256 amount
        ) external returns(bool);

    function RouterV1() external pure returns(bool);

}