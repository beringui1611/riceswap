// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISallerV1Router {

    event Deposit(address indexed presale, address indexed msgSender, uint256 amount);
    event Buy(address indexed presale, address indexed msgSender, uint256 amount);
    event Refund(address indexed presale, address indexed msgSender, uint256 amount);
    event Claim(address indexed presale, address indexed msgSender);



    function callbackDeposit(address presale, uint256 amount) external;

    function callbackBuy(address presale, uint256 amount) external;

    function callbackRefund(address presale, uint256 amount) external;

    function callbackClaim(address presale) external;

    function RouterV1() external pure returns(bool);

}