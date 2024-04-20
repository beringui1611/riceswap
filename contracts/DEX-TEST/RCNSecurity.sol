// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract RCNSecurity {

    error RCNPlataformPausable(bool _isPause);

    bool private isPause;

    constructor()
    {}

    modifier pausable(){
        _checkPausable();
        _;
    }

    function _checkPausable() internal virtual{
        if(isPause){
            revert  RCNPlataformPausable(isPause);
        }
    }

    function _pausable() internal virtual {
        isPause = true;
    }

    function _unpause() internal virtual {
        isPause = false;
    }

    function state() external view returns(bool){
        return isPause;
    }

    function _safeTransferLiquidity(address _token1, uint256 _amount, address _owner) internal virtual {
        if(isPause){
            IERC20 token1 = IERC20(_token1);
            (bool success) = token1.transfer(_owner, _amount);
            require(success, "TRANSFER NOT SENT");
        }
    }
}