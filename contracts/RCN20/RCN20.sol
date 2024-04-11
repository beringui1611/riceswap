// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IRCN20Error.sol";
import "./ICanPayHolders.sol";

contract RCN20 is IRCN20Errors, ReentrancyGuard {

    IERC20 tknAddress;
    IERC20 tknBacked;

    uint8 immutable monthlyFee = 1; 
    string constant segment = "Investimento";
    address public owner;
    uint256 public timer = 30 *24 *60 *60;
    bool public isPause;


    mapping(address => bool) public _admins;
    mapping(address => uint256) public timeLock;
    mapping(address => uint256) public _farming;
    mapping(address => uint256) public _lastedTimeDeposit;
    mapping(IERC20 => uint256) public reserve;

    struct Validator
    {
        address wallet;
        uint256 time;
    }

    Validator[] validator;


    event Deposit(address _owner, uint reserveMoreAmount, uint timeStamp);
    event Withdraw(address _owner, uint reserveLessAmount, uint timeStamp);
    event Payment(address _holder, uint reward, uint256 timeStamp);
    event Validate(address _validate, uint256 _tx, uint256 _timeStamp);

    constructor(address _tokenAddress, address _tokenBacked)
    {

         if(address(_tokenAddress) == address(0) 
         ||
           address(_tokenBacked) == address(0))
         {
             revert RCN20InitializeAddress(_tokenAddress, _tokenBacked);
         }

        tknAddress = IERC20(_tokenAddress);
        tknBacked = IERC20(_tokenBacked);
        owner = msg.sender;
    }


    function farm(uint256 amount) 
    external 
    nonReentrant 
    pausable
    canFarmHolders
    {

        if(tknAddress.balanceOf(msg.sender) < amount){
            revert RCN20InsufficientBalance(amount);
        }
        else if(amount <= 0){
            revert RCN20Amount(amount);
        }

        if(tknAddress.allowance(msg.sender, address(this)) < amount) revert RCN20Approve(false);

         (bool success) = tknAddress.transferFrom(
          msg.sender, 
          address(this), 
          amount);

        require(success, "error this transaction");
         
        timeLock[msg.sender] = block.timestamp;

        validator.push(Validator({
            wallet: msg.sender,
            time: block.timestamp
        }));

        _farming[msg.sender] += amount;
    }


    function removeFarm(uint amount) 
    external 
    nonReentrant 
    pausable
    canRemoveFarm
    {

        if(block.timestamp < timeLock[msg.sender] + timer)
        {
            revert RCN20TimeNotExpired(timer);
        }

        if(_farming[msg.sender] < amount)
        {
            revert RCN20InsufficientFarming(amount);
        }

        timeLock[msg.sender] = block.timestamp;

        validator.push(Validator({
            wallet: msg.sender,
            time: block.timestamp
        }));

        _farming[msg.sender] -= amount;

        tknAddress.transfer(msg.sender, amount);
    }


   function payholders() 
    nonReentrant
    pausable
    canPayHolders
    external 
    {
        uint256 amount = _farming[msg.sender];

        if(amount <= 0)
        {
            revert RCN20NotFarmingTokens(amount);
        }
        else if(block.timestamp <= timeLock[msg.sender] + timer)
        {
            revert RCN20TimeNotExpired(block.timestamp);
        }
        else if(tknBacked.balanceOf(address(this)) < amount)
        {
            revert RCN20InsufficientBalance(amount);
        }

        uint256 timeInSeconds = block.timestamp - timeLock[msg.sender];
        uint256 timeInMonth = timeInSeconds / (30 *24 *60 *60);

        uint256 totalAmount = timeInMonth;
        uint256 reward = (amount * monthlyFee / 100) * totalAmount;

        timeLock[msg.sender] = block.timestamp;

        validator.push(Validator({
            wallet: msg.sender,
            time: block.timestamp
        }));

        reserve[IERC20(tknBacked)] -= reward;

        (bool success) = tknBacked.transfer(msg.sender, reward);

        require(success, "transfer not sent");

        emit Payment(msg.sender, reward, block.timestamp);
    }



    function getWallets() external 
    view 
    returns(Validator[] memory)
    {
        return validator;
    }


    function checkValidator(address _address) external 
    view 
    returns(bool)
    {
       bool valid = block.timestamp >= timeLock[_address] + timer;

       if(valid)
       {
         return true;
       }
       else 
       {
         return false;
       }
    }

    function validate(address _address) 
    external
    pausable
    nonReentrant
    canPayHolders
    {
        _validate(_address);
    }


    function _validate(address _address)
    internal
    {
        uint256 amount = _farming[_address];

        if(amount <= 0)
        {
            revert RCN20NotFarmingTokens(amount);
        }
        else if(block.timestamp <= timeLock[_address] + timer)
        {
            revert RCN20TimeNotExpired(block.timestamp);
        }
        else if(tknBacked.balanceOf(address(this)) < amount)
        {
            revert RCN20InsufficientBalance(amount);
        }

        uint256 timeInSeconds = block.timestamp - timeLock[_address];
        uint256 timeInMonth = timeInSeconds / (30 *24 *60 *60);

        uint256 totalAmount = timeInMonth;
        uint256 reward = (amount * monthlyFee / 100) * totalAmount;

        uint256 feeValidate = (reward * monthlyFee /100);
        uint256 rewardTotal = reward - feeValidate;

        timeLock[_address] = block.timestamp;

        validator.push(Validator({
            wallet:_address,
            time: block.timestamp
        }));

        reserve[IERC20(tknBacked)] -= reward;

        (bool success) = tknBacked.transfer(_address, rewardTotal);
        (bool successValidate) = tknBacked.transfer(msg.sender, feeValidate);

        require(success, "transfer not sent receiver");
        require(successValidate, "transfer not sent for validator");

        emit Validate(_address, reward, block.timestamp);
    }


    function deposit(uint256 amount) external 
    onlyAdmin 
    nonReentrant
    {
        if(amount <= 0) 
        {
            revert RCN20Amount(amount);
        }

        if(tknBacked.allowance(msg.sender, address(this)) < amount)
        {
            revert RCN20Approve(false);
        }


        if(address(tknBacked) == address(0))
        {
            revert RCN20AddressZero(address(0));
        }

        (bool success) = tknBacked.
        transferFrom(
        msg.sender,
        address(this), 
        amount);

        require(success, "invalid transaction");

        reserve[IERC20(tknBacked)] += amount;
        emit Deposit(msg.sender, amount, block.timestamp);
    }


    function withdraw(uint256 amount) 
    external 
    onlyAdmin 
    {
        if(amount <= 0) revert RCN20Amount(amount);

        if(address(tknBacked) == address(0)){
            revert RCN20AddressZero(address(0));
        }

        if(tknBacked.balanceOf(address(this)) < amount) revert RCN20InsufficientBalance(amount);

        (bool success) = tknBacked.transfer(owner, amount);

        if(success){
          reserve[IERC20(tknBacked)] -= amount;
          emit Withdraw(msg.sender, amount, block.timestamp);
        }                                                                                                                                        
    }


    function pause() 
    external 
    onlyOwner
    {
        isPause = true;
    }

    function unpause() 
    external 
    onlyOwner
    {
        isPause = false;
    }


    function addAdmin(address _admin) 
    external 
    onlyOwner 
    {
        if(address(_admin) == address(0)) revert RCN20AddressZero(_admin);

        _admins[_admin] = true;

    }


    function removeAdmin(address _admin) 
    external 
    onlyOwner 
    {
        _admins[_admin] = false;
    }


    function isContract(address _account) 
    internal
    view
    returns(bool)
    {
        uint256 size;

        assembly {
             size := extcodesize(_account)
        }

        return size > 0;
    }

    modifier canPayHolders()
    {
        if(isContract(msg.sender))
        {
            require(ICanConnectRCN20(msg.sender).canPayHolders(), 
            "this contract not support interface"
            );
        }
        _;  
    }

    modifier canFarmHolders()
    {
        if(isContract(msg.sender))
        {
            require(ICanConnectRCN20(msg.sender).canFarmHolders(), 
            "this contract not support interface"
            );
        }
        _;
    }

       modifier canRemoveFarm()
    {
        if(isContract(msg.sender))
        {
            require(ICanConnectRCN20(msg.sender).canRemoveFarm(), 
            "this contract not support interface"
            );
        }
        _;
    }

    modifier onlyOwner 
    {
        require(msg.sender == owner, "only owner permission");
        _;
    }

    modifier onlyAdmin()
    {
        require(msg.sender == owner || _admins[msg.sender] == true, "only admins have permission this function");
        _;
    }

    modifier pausable()
    {
        require(isPause == false, "This protocol has not yet started");
        _;
    }
}