// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRiceswapV1Factory {

    function owner() external view returns(address);

    function getFee() external view returns(uint16);

    function createPool(
        address token0,
        address token1,
        uint16 fee,
        uint64 index
    ) 
    external returns(address pool);

    function createPool40(
        address token0, 
        address token1, 
        uint16 fee, 
        uint64 index
    )
    external returns(address pool);

    function setFee(uint8 _fee) external;
    
}
