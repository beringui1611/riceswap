// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRiceswapV1Saller {

    function deposit(uint256 amount) external;

    function buy(address _msgSender, uint256 amount) external;

    function refund(address _msgSender, uint256 amount) external;

    function claim(address _msgSender) external;

    function token0() external view returns(address);

    function token1() external view returns(address);

}