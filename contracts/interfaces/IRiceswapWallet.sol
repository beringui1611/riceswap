// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRiceswapWallet {

    function withdraw(address tokne0, uint256 amount) external;

    function receiver(uint256 amount, address tokenReceiver) external returns(bool);

}