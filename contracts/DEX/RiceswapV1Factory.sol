// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "./Interface/IRiceswapV1Errors.sol";
import "./RiceswapV1Deployer.sol";
import "hardhat/console.sol";

contract RiceswapV1Factory is IRiceswapV1Errors, RiceswapV1Deployer{

    address public owner;
    uint8 public dexFee;
    uint256 timer = 30 *24 *60 *60;

    
    mapping(address => address) public getPool;
    mapping(address => address) private _token0;

    event PoolCreated(address indexed token0, address indexed token1, uint16 fee, address indexed pool);
    event OwnerChanged(address indexed newOwner, address indexed oldOwner);
    event NewFee(uint256 indexed _fee);

    constructor()
    {
        owner = msg.sender;
        dexFee = 5;
    }


    function createPool(
        address token0,
        address token1,
        uint16 fee,
        uint64 index
    ) 
    external returns(address pool)
    {
        if(address(token0) == address(0))  revert IRiceswapAddressZero(token0);
        if(address(token1) == address(0))  revert IRiceswapAddressZero(token1);
        if(fee <= 0) revert IRiceswapPercentInvalid(fee);
        if(index <= 0) revert IRiceswapIndexInvalid(index);
        if(token0 == _token0[token0]) revert IRiceswapAddressDifferentToken0(token0);
        
        pool = deploy(address(this), token0, token1, msg.sender, timer, fee, index);
        getPool[token0] = pool; 
        _token0[token0] = token0;

        emit PoolCreated(token0, token1, fee, pool);

        console.log("contract", pool);

        return pool;   
    }


    function createPool40(
        address token0,
        address token1,
        uint16 fee,
        uint64 index
    ) 
    external virtual returns(address pool)
    {
        if(address(token0) == address(0))  revert IRiceswapAddressZero(token0);
        if(address(token1) == address(0))  revert IRiceswapAddressZero(token1);
        if(fee <= 0) revert IRiceswapPercentInvalid(fee);
        if(index <= 0) revert IRiceswapIndexInvalid(index);
        if(token0 == _token0[token0]) revert IRiceswapAddressDifferentToken0(token0);
        
        pool = deploy40(address(this), token0, token1, msg.sender, timer, fee, index);
        getPool[token0] = pool; 
        _token0[token0] = token0;

        emit PoolCreated(token0, token1, fee, pool);

        console.log("contract", pool);

        return pool;   
    }


    function setOwner(address _owner) external {
        require(msg.sender == owner, "OWNER");
        owner = _owner;
        emit OwnerChanged(owner, _owner);
    }


    function setFee(uint8 _fee) external {
        require(msg.sender == owner, "OWNER");
        dexFee = _fee;

        emit NewFee(_fee);
    }

    
    function getFee() external view returns(uint256){
        return dexFee;
    }
    
}