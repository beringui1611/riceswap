// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "./interfaces/IRiceswapV1Errors.sol";
import "./RiceswapV1Deployer.sol";

contract RiceswapV1Factory is IRiceswapV1Errors, RiceswapV1Deployer{

    address public owner;
    uint8 public dexFee;
    uint256 timer = 30 *24 *60 *60; ///@dev Used to define the payment time for pools.

    
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

    /**
     *@notice CreatePool -- This function creates only the RCN20. --
     *@dev Responsible for creating the pool, this is where users will call 
     in their smart contracts or through interfaces to create their pools.
     @return pool It returns the address of your new pool.
     */

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

        return pool;   
    }

    /**
     *@notice CreatePool -- This function creates only the RCN40. --
     *@dev Responsible for creating the pool, this is where users will call 
     in their smart contracts or through interfaces to create their pools.
     @return pool It returns the address of your new pool.
     */

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

        return pool;   
    }

    // @riceswap -- manager --
    function setOwner(address _owner) external {
        require(msg.sender == owner, "OWNER");
        owner = _owner;
        emit OwnerChanged(owner, _owner);
    }

    // @riceswap -- fee --
    function setFee(uint8 _fee) external {
        require(msg.sender == owner, "OWNER");
        dexFee = _fee;

        emit NewFee(_fee);
    }

    ///@return dexFee This function returns the real-time rice rate for pools to instantiate and utilize, as defined in the pool. 
    function getFee() external view returns(uint256){
        return dexFee;
    }
    
}