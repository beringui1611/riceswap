// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Interface/IRiceswapV1Factory.sol";
import "./utils/SafeTransfers.sol";
import "./Interface/IRiceswapV1Errors.sol";
import "./utils/Math.sol";
import "hardhat/console.sol";

contract RiceswapV1Pool is SafeTransfer, IRiceswapV1Errors, Math{

    address public immutable token0;

    address public immutable token1;

    address public immutable admin;

    uint256 public immutable timer;

    uint16 public immutable fee;

    uint64 public immutable index;

    address public immutable factory;

    uint8 public dexFee;

    event RemoveFarm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event PayHolder(address indexed _to, uint256 indexed _txMonth, uint256 _timestamp);
    event Validator(address indexed _from, uint256 _txMonth, address indexed _validator, uint256 _txValidator);
    event Deposit(address indexed _from, address indexed _to, uint256 _amount);

    modifier onlyFactoryOwner(){
        require(msg.sender == IRiceswapV1Factory(factory).owner());
        _;
    }

    mapping(address => uint256) public farming;
    mapping(address => uint256) public timeLock;
    mapping(address => uint256) public liquidity;

    constructor(
        address _factory,
        address _token0, 
        address _token1, 
        address _admin, 
        uint256 _timer, 
        uint16 _fee, 
        uint64 _index,
        uint8 _dexFee
        )
    {
        factory = _factory;
        token0 = _token0;
        token1 = _token1;
        admin = _admin;
        timer = _timer;
        fee = _fee;
        index = _index;
        dexFee = _dexFee;
    }


    function farm(
        uint256 _amount
        ) external 
        {

          safeTransferFarm(token0, _amount);
          timeLock[msg.sender] = block.timestamp;
          farming[msg.sender] += _amount;

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
        uint256 amount = farming[msg.sender];

        if(amount <= 0) revert IRiceswapInsufficientFarming(amount);
        if(block.timestamp <= timeLock[msg.sender] + timer) revert IRiceswapTimeNotExpired(block.timestamp);

        (uint256 totalAmount) = calcTime(timeLock[msg.sender]);
        (uint256 txMonth) = calcPayment(amount, fee, index, totalAmount);

        (uint256 txFee) = calcFee(txMonth, dexFee);

        if(liquidity[address(this)] < txMonth) revert IRiceswapLiquidityInsufficient(txMonth);

        timeLock[msg.sender] = block.timestamp;
        liquidity[address(this)] -= txMonth;
      
        safeTransferPayment(token1, txMonth - txFee, txFee, admin);

        emit PayHolder(msg.sender, txMonth, block.timestamp);
    }

    function validator(
        address _from
        ) external 
        {
          uint256 amount = farming[_from];

          if(amount <= 0) revert IRiceswapInsufficientFarming(amount);
          if(block.timestamp <= timeLock[_from] + timer) revert IRiceswapTimeNotExpired(block.timestamp);

          (uint256 totalAmount) = calcTime(timeLock[_from]);

          (uint256 txMonth) = calcPayment(amount, fee, index, totalAmount);

          (uint256 txFee) = calcFee(txMonth, dexFee);

          (uint256 txValidator) = calcValidator(txMonth);

          if(liquidity[address(this)] < txMonth) revert IRiceswapLiquidityInsufficient(txMonth);

          timeLock[_from] = block.timestamp;
          liquidity[address(this)] -= txMonth;

          safeTransferValidator(token1, _from, txMonth - txFee - txValidator, txFee, txValidator, admin);

          emit Validator(_from, txMonth, msg.sender, txValidator);
        }

        function deposit(
            uint256 _amount
            ) external 
            {
                safeTransferDeposit(token1, _amount);
                liquidity[address(this)] += _amount;

                emit Deposit(msg.sender, address(this), _amount);
                
            }
}

