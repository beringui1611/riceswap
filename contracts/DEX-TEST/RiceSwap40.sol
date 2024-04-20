// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IRiceSwapErrors.sol";
import "./RCNOwnable.sol";
import "./Validators.sol";
import "./RCNBlackList.sol";
import "./RCNSecurity.sol";

contract RiceSwap40 is IRiceSwapErrors, RCNOwnable, Validators, ReentrancyGuard, RCNBlackList, RCNSecurity{

    uint16 dexFee = 5;

    struct Pools 
    {
        address token0;
        address token1;
        address admin;
        uint256 balance;
        uint256 liquidityEscrow;
        uint256 timer;
        uint16 fee;
        uint64 index;
    }

    mapping(address => Pools) public pools;
    mapping(address => mapping(address => uint)) public _farming;
    mapping(address => mapping(address => uint256)) public timeLock;

    event NewPool(address _token0, address _admin, string indexed _type);
    event Farm(address _token0, address _to, uint256 _amount);
    event RemoveFarm(address _token0, address _to, uint256 _amount);
    event PayHolder( address _token0, address _to, uint256 _txMonth, uint256 txFee);
    event Validate(address _token0, address _from, uint256 txMonth, uint256 txValidator, uint256 txFee);

    constructor()
    RCNOwnable(msg.sender)
    {}



    function createPool(
        address _token0,
        address _token1,
        uint256 _amount,
        uint256 _liquidityEscrow,
        uint256 _time,
        uint16 _percent,
        uint64 _index
    ) external nonReentrant pausable{
        IERC20 token0 = IERC20(_token0);
        IERC20 token1 = IERC20(_token1);

        if (pools[_token0].token0 == _token0) {
            revert IRCNPoolAlreadyExist(_token0);
        } else if (_amount < (100_000 * 10 ** 18)) {
            revert IRCNAmount(_amount);
        } else if (
            address(_token0) == address(0) || address(_token1) == address(0)
        ) 
        {
            revert IRCNAddressZero(_token0, _token1);
        }

        uint256 txFee = ((_amount * dexFee) / 10000);
        uint256 amountFee = _amount - txFee;
        bool successToken0 = token0.transferFrom(
            msg.sender,
            address(this),
            amountFee
        );
        bool successPercent = token0.transferFrom(msg.sender, _owner, txFee);
        bool successToken1 = token1.transferFrom(
            msg.sender,
            address(this),
            _liquidityEscrow
        );

        if (!successToken0 || !successToken1 || !successPercent) {
            revert IRCNTokenNotTransfer(false);
        }

        pools[_token0] = Pools({
            token0: _token0,
            token1: _token1,
            admin: msg.sender,
            balance: _amount,
            liquidityEscrow: _liquidityEscrow,
            timer: _time,
            fee: _percent,
            index: _index
        });

        emit NewPool(_token0, msg.sender, "variable income");
        //criar wallet para receber as porcentagens de novos pools criados
    }



    function farm(
        address _token0, 
        uint _amount
    ) external nonReentrant blackList(_token0) pausable{

        IERC20 token0 = IERC20(_token0);

        if (token0.balanceOf(msg.sender) < _amount) {
            revert IRCNBalanceOfInsufficient(_amount);
        } else if (pools[_token0].token0 != _token0) {
            revert IRCNProtocolNotExist(_token0);
        } else if (_amount <= 0) {
            revert IRCNAmount(_amount);
        } else if (token0.allowance(msg.sender, address(this)) < _amount) {
            revert IRCNNotApprove(false);
        }

        bool success = token0.transferFrom(msg.sender, address(this), _amount);

        if (!success) {
            revert IRCNTokenNotTransfer(success);
        }

        timeLock[_token0][msg.sender] = block.timestamp;
        _farming[_token0][msg.sender] += _amount;

        emit Farm(_token0, msg.sender, _amount);

        increaseValidator(_token0, _amount, block.timestamp);
    }



    function removeFarm(
        address _token0,
        uint256 _amount
    ) external nonReentrant blackList(_token0) {
        IERC20 token0 = IERC20(_token0);

        if (
            block.timestamp <
            timeLock[_token0][msg.sender] + pools[_token0].timer
        ) {
            revert IRCNTimeNotExpired(block.timestamp);
        } else if (_farming[_token0][msg.sender] < _amount) {
            revert IRCNInsufficientFarming(_amount);
        }

        timeLock[_token0][msg.sender] = block.timestamp;

        _farming[_token0][msg.sender] -= _amount;

        bool success = token0.transfer(msg.sender, _amount);

        if (!success) {
            revert IRCNTokenNotTransfer(success);
        }

        emit RemoveFarm(_token0, msg.sender, _amount);

        decreaseValidation(_token0, _amount, block.timestamp);
    }



    function payholders(address _token0) external nonReentrant blackList(_token0) pausable {
        verifyPoolExist(_token0);

        address tknLiquidity = pools[_token0].token1;
        IERC20 tkn = IERC20(tknLiquidity);

        uint256 amount = _farming[_token0][msg.sender];

        if (amount <= 0) {
            revert IRCNInsufficientFarming(amount);
        } else if (
            block.timestamp <=
            timeLock[_token0][msg.sender] + pools[_token0].timer
        ) {
            revert IRCNTimeNotExpired(block.timestamp);
        }

        uint256 timeInSeconds = block.timestamp - timeLock[_token0][msg.sender];
        uint256 timeInMonth = timeInSeconds / (30 * 24 * 60 * 60);
        uint256 totalAmount = timeInMonth;

        uint256 fee = pools[_token0].fee;

        uint64 _index = pools[_token0].index;
        uint256 txMonth = ((amount * fee) / _index) * totalAmount;
        uint256 txFee = ((amount * dexFee) / 10000);

        uint256 reward = (txMonth - txFee);

        if (pools[_token0].liquidityEscrow < txMonth) {
            revert IRCNInsufficientLiquidity(txMonth);
        }

        timeLock[_token0][msg.sender] = block.timestamp;
        pools[_token0].liquidityEscrow -= txMonth;

        bool successReward = tkn.transfer(msg.sender, reward);
        bool successDexFee = tkn.transfer(_owner, txFee);

        if (!successReward || !successDexFee) {
            revert IRCNTokenNotTransfer(false);
        }

        //WALLET PARA RECEBER TAXAS DE PAGAMENTO
        emit PayHolder(_token0, msg.sender, txMonth, 0);
    }



    function updateIncome(address _token0, uint16 _fee) external {
        require(msg.sender == pools[_token0].admin, "UNAUTHORIZED");
        if(address(_token0) == address(0)){
            revert IRCNAddressZero(_token0, address(0));
        }

        pools[_token0].fee = _fee;
    }



    function updateIndex(address _token0, uint64 _index) external {
        require(msg.sender == pools[_token0].admin, "UNAUTHORIZED");
        if(address(_token0) == address(0)){
            revert IRCNAddressZero(_token0, address(0));
        }

        pools[_token0].index = _index;
    }



    function updateFee(uint16 _fee) external onlyAdmin {
        dexFee = _fee;
    }



    function pause() external onlyOwner {
        _pausable();
    }



    function unpause() external onlyOwner {
        _unpause();
    }



    function safeTransfer(address _token0) external {
        require(msg.sender == pools[_token0].admin, "UNAUTHORIZED");
        address token1 = pools[_token0].token1;
        uint256 amount = pools[_token0].liquidityEscrow;
        address _owner = pools[_token0].admin;
        _safeTransferLiquidity(token1, amount, _owner);
    }



    function punishProtcol(address _protocol) external onlyAdmin pausable{
        punish(_protocol);
    }



    function unPunishProtocol(address _protocol) external onlyAdmin pausable{
        unPunish(_protocol);
    }



    function deleteProtocol(address _protocol) external onlyAdmin pausable{
        (bool isPunish) = punishes(_protocol);
        if(isPunish){
            delete pools[_protocol];
        }
    }



    function validator(address _token0, address _from) external nonReentrant pausable(){
        _validator(_token0, _from);
    }



    function verifyPool(address _token0) external view returns (Pools memory) {
        return pools[_token0];
    }



    function viewFee() external view returns(uint16){
        return dexFee;
    }



    function checkValidators(
        address _token0
    ) external view returns (Validator[] memory) {
        return _checkValidators(_token0);
    }



    function verifyPoolExist(address _token0) internal view returns (bool) {
        if (pools[_token0].token0 != _token0) {
            revert IRCNPoolAlreadyExist(_token0);
        }

        return true;
    }



    function _validator(
        address _token0, 
        address _from
        ) internal virtual {

        verifyPoolExist(_token0);

        address tknLiquidity = pools[_token0].token1;
        IERC20 tkn = IERC20(tknLiquidity);

        uint256 amount = _farming[_token0][_from];

        if (amount <= 0) {
            revert IRCNInsufficientFarming(amount);
        } else if (
            block.timestamp <= timeLock[_token0][_from] + pools[_token0].timer
        ) {
            revert IRCNTimeNotExpired(block.timestamp);
        }

        uint256 timeInSeconds = block.timestamp - timeLock[_token0][_from];
        uint256 timeInMonth = timeInSeconds / (30 * 24 * 60 * 60);
        uint256 totalAmount = timeInMonth;

        uint256 fee = pools[_token0].fee;
        uint64 _index = pools[_token0].index;

                
        uint256 txMonth = ((amount * fee) / _index) * totalAmount;
        uint256 txFee = ((amount * dexFee) / 10000);
        uint256 txValidator = ((txMonth * 10) / 100);

        uint256 reward = (txMonth - txFee);
        uint256 rewardFee = reward - txValidator;

        if (pools[_token0].liquidityEscrow < txMonth) {
            revert IRCNInsufficientLiquidity(txMonth);
        }

        timeLock[_token0][_from] = block.timestamp;
        pools[_token0].liquidityEscrow -= txMonth;

        bool successReward = tkn.transfer(_from, rewardFee);
        bool successDexFee = tkn.transfer(_owner, txFee);
        bool successValidatorFee = tkn.transfer(msg.sender, txValidator);

        if (!successReward || !successDexFee || !successValidatorFee) {
            revert IRCNTokenNotTransfer(false);
        }
    }
}
