// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "./Interface/IRiceswapV1Errors.sol";
import "./RiceswapV1Deployer.sol";

contract RiceswapV1Factory is IRiceswapV1Errors, RiceswapV1Deployer{

    address public owner;

    struct Pools 
    {
        address admin;
        uint8 income;
        address coin;
    }

    mapping(address => Pools) getPool;

    event PoolCreated(address indexed token0, address indexed token1, uint16 fee, address indexed pool);
    event OwnerChanged(address indexed newOwner, address indexed oldOwner);

    constructor()
    {
        owner = msg.sender;
    }


    function createPool(
        address token0,
        address token1,
        uint256 time,
        uint16 fee,
        uint64 index
    ) 
    external virtual  returns(address pool)
    {
        if(address(token0) == address(0))  revert IRiceswapAddressZero(token0);
        if(address(token1) == address(0))  revert IRiceswapAddressZero(token1);
        if(time <= 0) revert IRiceswapTimeInvalid(time);
        if(fee <= 0) revert IRiceswapPercentInvalid(fee);
        if(index <= 0) revert IRiceswapIndexInvalid(index);
        
        pool = deploy(address(this), token0, token1, msg.sender, time, fee, index);
        getPool[pool] = Pools({admin: msg.sender, income: 1, coin: token0});

        emit PoolCreated(token0, token1, fee, pool);
            
    }


    function setOwner(address _owner) external {
        require(msg.sender == owner);
        owner = _owner;
        emit OwnerChanged(owner, _owner);
    }
    
}