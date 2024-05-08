// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IRiceswapV1Factory.sol";
import "../libraries/SafeTransfers.sol";
import "../interfaces/IRiceswapV1Errors.sol";
import "../libraries/Math.sol";
import "../libraries/SecurityCalls.sol";

///@title Riceswap40V1Pool -- Variable income --

contract Riceswap40V1Pool is  IRiceswapV1Errors, SafeTransfer, Math, SecurityCall {
   
    address public immutable token0;

    address public immutable token1;

    address public owner;

    uint256 public immutable timer;

    uint16 public fee;

    uint64 public index;

    address public immutable factory;

    address public immutable dexWallet;

    ///@dev Events emitted for every user request, keeping the pool informed
    event Farm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event RemoveFarm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    event PayHolder(address indexed _to, uint256 indexed _txMonth, uint256 _timestamp);
    event Validator(address indexed _from, uint256 _txMonth, address indexed _validator, uint256 _txValidator);
    event Deposit(address indexed _from, address indexed _to, uint256 _amount);
    event TransferedOwnership(address indexed oldOwner, address indexed newOwner);



    mapping(address => uint256) public farming; ///@dev Mapping storing users' invested token amounts.
    mapping(address => uint256) public timeLock; ///@dev Mapping storing lock-up time for each user.
    mapping(address => uint256) public liquidity; ///@dev Liquidity information stored here.

    constructor(
        address _factory,
        address _token0, 
        address _token1, 
        address _admin, 
        address _dexWallet,
        uint256 _timer, 
        uint16 _fee, 
        uint64 _index
        )
    {
        factory = _factory;
        token0 = _token0;
        token1 = _token1;
        owner = _admin;
        dexWallet = _dexWallet;
        timer = _timer;
        fee = _fee;
        index = _index;
    }

     /**
      @notice FARM -- Deposit funds for variable income --
      @dev Users deposit tokens into the pool to earn fixed income. 
      The deposited tokens will receive monthly percentages based on each project.
      Once the user transfers their tokens to this contract, we record the current time 
      and lock it so that only after a certain time period X for each project, 
      they receive their earnings.
      @param _msgSender Address of the user depositing funds.
      @param _amount Amount to deposit.
     */

    function farm(
        uint256 _amount,
        address _msgSender
        ) external noDelegateCall(_msgSender)
        {

          safeTransferFarm(token0, _amount);
          timeLock[_msgSender] = block.timestamp;
          farming[_msgSender] += _amount;

          emit Farm(_msgSender, _amount, block.timestamp);
        }

    /**
      @notice REMOVE FARM -- Withdraw funds from varaible income --
      @dev Users can withdraw their tokens from variable income to perform other operations.
      They can only remove funds after a certain period (e.g., 30 days) to avoid conflicts with their earnings.
      @param _msgSender Address of the user withdrawing funds.
      @param _amount Amount to withdraw.
     */

    function removeFarm(
        uint256 _amount,
        address _msgSender
        ) external noDelegateCall(_msgSender)
        {
            if(block.timestamp < timeLock[_msgSender] + timer) revert IRiceswapTimeNotExpired(block.timestamp);
            if(farming[_msgSender] < _amount) revert IRiceswapInsufficientFarming(_amount);

            timeLock[_msgSender] = block.timestamp;
            farming[_msgSender] -= _amount;

            safeTransferRemoveFarm(token0, _amount, _msgSender);

            emit RemoveFarm(_msgSender, _amount, block.timestamp);
        }

    /**
     @notice PAYHOLDERS -- Pay earnings to holders --
     @dev This function pays earnings to holders. Users specify their wallet address,
     and the function verifies all necessary conditions to pay out their monthly earnings.
     @param _msgSender User's wallet address.
     */

    function payholders(
        address _msgSender
        ) external noDelegateCall(_msgSender)
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
      
            safeTransferPayment(token1, txMonth - txFee, txFee, dexWallet, _msgSender);

            emit PayHolder(_msgSender, txMonth, block.timestamp);
        }

     /**
      @notice VALIDATOR -- Validator ecosystem --
      @dev This function allows users to validate pending payments and be rewarded for it.
      It's a simple way to generate income and improve payment performance for everyone.
      @param _from Validator's address.
      @param _msgSender Address of the recipient.
     */   

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

          safeTransferValidator(token1, _from, txMonth - txFee - txValidator, txFee, txValidator, dexWallet, _msgSender);

          emit Validator(_from, txMonth, _msgSender, txValidator);
        }

    //@riceswap Deposit liquidity to the contract
    function deposit(
        uint256 _amount
        ) external 
        {
            safeTransferDeposit(token1, _amount);
            liquidity[address(this)] += _amount;

            emit Deposit(msg.sender, address(this), _amount);
                
        }
    
    /**
     @notice Function dedicated to the pool's owner to update its fee
     @param _newFee receives the new protocol fee
    */

    function upgradeableFee(
        uint16 _newFee
        ) external 
        {
            require(msg.sender == owner, "A");
            require(_newFee > 0, "0");

            fee = _newFee;
        }

    
    /**
    @notice Function dedicated to the pool's owner to adjust its fee index
    Example: 1000 * 1 / index
    @param _newIndex receives the new index
    */

    function upgradeableIndex(
        uint64 _newIndex
        ) external 
        {
            require(msg.sender == owner, "A");
            require(_newIndex > 0, "0");

            index = _newIndex;
        }

    //@riceswap Fetch real-time fees from the dex for each transaction
    function updateFee() 
        internal virtual view returns(uint256)
        {
            return IRiceswapV1Factory(factory).getFee();
        }

    function transferOwnership(
        address _owner
         ) external returns(address ret){
        require(msg.sender == owner, "O");
        address oldOwner;
        assembly {
                sstore(owner.slot, _owner)

                ret := _owner
                oldOwner := caller()
        }

        emit TransferedOwnership(oldOwner, _owner);
    }

}