// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Interface/IRiceswapV1Factory.sol";
import "./utils/SafeTransfers.sol";
import "./Interface/IRiceswapV1Errors.sol";

contract RiceswapV1Pool is SafeTransfer, IRiceswapV1Errors{

    address public immutable token0;

    address public immutable token1;

    address public immutable admin;

    uint256 public immutable liquidityEscrow;

    uint256 public immutable timer;

    uint16 public immutable fee;

    uint64 public immutable index;

    address public immutable factory;

    event RemoveFarm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);

    modifier onlyFactoryOwner(){
        require(msg.sender == IRiceswapV1Factory(factory).owner());
        _;
    }

    mapping(address => uint256) farming;
    mapping(address => uint256) timeLock;

    constructor(
        address _factory,
        address _token0, 
        address _token1, 
        address _admin, 
        uint256 _timer, 
        uint16 _fee, 
        uint64 _index)
    {
        factory = _factory;
        token0 = _token0;
        token1 = _token1;
        admin = _admin;
        timer = _timer;
        fee = _fee;
        index = _index;
    }


    function farm(
        uint256 _amount
        ) external 
        {

          safeTransferFarm(token0, _amount, address(this));
          farming[msg.sender] += _amount;
          timeLock[msg.sender] = block.timestamp;
        }


    function removeFarm(
        uint256 _amount 
        ) external
        {
            if(block.timestamp < timeLock[msg.sender] + timer) revert IRiceswapTimeNotExpired(block.timestamp);
            if(farming[msg.sender] < _amount) revert IRiceswapInsufficientFarming(_amount);

            timeLock[msg.sender] = block.timestamp;
            farming[msg.sender] -= _amount;

            safeTransferRemoveFarm(token0, _amount);

            emit RemoveFarm(msg.sender, _amount, block.timestamp);
        }

    function payholders() 
    external
    {
        
    }
}

