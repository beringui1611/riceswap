// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IRiceswapV1Factory.sol";
import "./libraries/SafeTransfers.sol";
import "./interfaces/IRiceswapV1Errors.sol";
import "./libraries/Math.sol";

//corrigir falha de qualquer user chamar a função por você

contract Riceswap20V1Pool is IRiceswapV1Errors, SafeTransfer, Math {
    
    address public immutable token0;

    address public immutable token1;

    address public immutable admin;

    uint256 public immutable timer;

    uint16 public immutable fee;

    uint64 public immutable index;

    address public immutable factory;

    event Farm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event RemoveFarm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event PayHolder(address indexed _to, uint256 indexed _txMonth, uint256 _timestamp);
    event Validator(address indexed _from, uint256 _txMonth, address indexed _validator, uint256 _txValidator);
    event Deposit(address indexed _from, address indexed _to, uint256 _amount);


    mapping(address => uint256) public farming; ///@param Farming where addresses containing the amount of tokens invested will be saved.  
    mapping(address => uint256) public timeLock; ///@param Timelock stores the address containing the lock-up time for each user.
    mapping(address => uint256) public liquidity; ///@param Liquidity Here we store the liquidity information for this contract.
    

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

    /**
     * @param _msgSender --> Provide your wallet address to save in the farming pool, where you will receive the rewards at the end of the 30-day period.
     * @param _amount --> Please specify the amount you wish to stake for earning rewards.
     * @dev The function used to stake your tokens in the specific protocol computes the value
     * and transfers it to the address saving the invested amount and locking the time to receive after 30 days. 
    */
    function farm(
        address _msgSender,
        uint256 _amount
        ) external 
        {

          safeTransferFarm(token0, _amount);
          timeLock[_msgSender] = block.timestamp;
          farming[_msgSender] += _amount;

          emit Farm(_msgSender, _amount, block.timestamp);
        }

    /**
     * @param _msgSender --> _msgSender provides the address of the recipient who will receive the tokens back.
     * @param _amount --> Specify the amount you wish to withdraw as earnings.
     * @dev Perform the reverse operation of farming, withdrawing your earned tokens. 
     * Remember, this function is only available after 30 days of staking your tokens for farming.
     */

    function removeFarm(
        address _msgSender,
        uint256 _amount 
        ) external
        {
            if(block.timestamp < timeLock[_msgSender] + timer) revert IRiceswapTimeNotExpired(block.timestamp);
            if(farming[_msgSender] < _amount) revert IRiceswapInsufficientFarming(_amount);

            timeLock[_msgSender] = block.timestamp;
            farming[_msgSender] -= _amount;

            safeTransferRemoveFarm(token0, _amount, _msgSender);

            emit RemoveFarm(_msgSender, _amount, block.timestamp);
        }

    /**
    * @dev This function takes the provided wallet address and processes the reward payment to it, 
    * calculating the time and fees to be paid.
    * @param _msgSender --> Please provide the wallet address where the earnings should be sent.
    */
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

}