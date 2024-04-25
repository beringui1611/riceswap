// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Interface/IRiceswapV1Factory.sol";
import "./libraries/SafeTransfers.sol";
import "./Interface/IRiceswapV1Errors.sol";
import "./libraries/Math.sol";
import "hardhat/console.sol";

contract Riceswap40V1Pool is  IRiceswapV1Errors, SafeTransfer, Math {
   
    address public immutable token0;

    address public immutable token1;

    address public immutable admin;

    uint256 public immutable timer;

    uint16 public fee;

    uint64 public index;

    address public immutable factory;

    event Farm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event RemoveFarm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event PayHolder(address indexed _to, uint256 indexed _txMonth, uint256 _timestamp);
    event Validator(address indexed _from, uint256 _txMonth, address indexed _validator, uint256 _txValidator);
    event Deposit(address indexed _from, address indexed _to, uint256 _amount);


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
        uint64 _index
        )
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
        uint256 _amount,
        address _msgSender
        ) external 
        {

          safeTransferFarm(token0, _amount);
          timeLock[_msgSender] = block.timestamp;
          farming[_msgSender] += _amount;

          emit Farm(_msgSender, _amount, block.timestamp);
        }

    function removeFarm(
        uint256 _amount,
        address _msgSender
        ) external
        {
            if(block.timestamp < timeLock[_msgSender] + timer) revert IRiceswapTimeNotExpired(block.timestamp);
            if(farming[_msgSender] < _amount) revert IRiceswapInsufficientFarming(_amount);

            timeLock[_msgSender] = block.timestamp;
            farming[_msgSender] -= _amount;

            safeTransferRemoveFarm(token0, _amount, _msgSender);

            emit RemoveFarm(_msgSender, _amount, block.timestamp);
        }

    function payholders(
        address _msgSender
        ) external
        {
            uint256 amount = farming[_msgSender];

            if(amount <= 0) revert IRiceswapInsufficientFarming(amount);
            if(block.timestamp <= timeLock[_msgSender] + timer) revert IRiceswapTimeNotExpired(block.timestamp);

            (uint256 totalAmount) = calcTime(timeLock[_msgSender]);
            (uint256 txMonth) = calcPayment(amount, fee, index, totalAmount);

            (uint256 txFee) = calcFee(txMonth, updateFee());

            if(liquidity[address(this)] < txMonth) revert IRiceswapLiquidityInsufficient(txMonth);

            timeLock[_msgSender] = block.timestamp;
            liquidity[address(this)] -= txMonth;
      
            safeTransferPayment(token1, txMonth - txFee, txFee, admin, _msgSender);

            emit PayHolder(_msgSender, txMonth, block.timestamp);
        }

    function validator(
        address _from,
        address _msgSender
        ) external 
        {
          uint256 amount = farming[_from];

          if(amount <= 0) revert IRiceswapInsufficientFarming(amount);
          if(block.timestamp <= timeLock[_from] + timer) revert IRiceswapTimeNotExpired(block.timestamp);

          (uint256 totalAmount) = calcTime(timeLock[_from]);

          (uint256 txMonth) = calcPayment(amount, fee, index, totalAmount);

          (uint256 txFee) = calcFee(txMonth, updateFee());

          (uint256 txValidator) = calcValidator(txMonth);

          if(liquidity[address(this)] < txMonth) revert IRiceswapLiquidityInsufficient(txMonth);

          timeLock[_from] = block.timestamp;
          liquidity[address(this)] -= txMonth;

          safeTransferValidator(token1, _from, txMonth - txFee - txValidator, txFee, txValidator, admin, _msgSender);

          emit Validator(_from, txMonth, _msgSender, txValidator);
        }

    function deposit(
        uint256 _amount
        ) external 
        {
            safeTransferDeposit(token1, _amount);
            liquidity[address(this)] += _amount;

            emit Deposit(msg.sender, address(this), _amount);
                
        }

    function updateFee() 
        internal virtual view returns(uint256)
        {
            return IRiceswapV1Factory(factory).getFee();
        }

    function upgradeableFee(
        uint16 _newFee) 
        external 
        {
            require(msg.sender == admin, "A");
            require(_newFee > 0, "0");

            fee = _newFee;
        }

    function upgradeableIndex(
        uint64 _newIndex
        ) external 
        {
            require(msg.sender == admin, "A");
            require(_newIndex > 0, "0");

            index = _newIndex;
        }


}