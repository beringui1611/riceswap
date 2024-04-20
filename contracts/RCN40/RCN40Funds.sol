// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IRCN40.sol";
import "./IRCN40Error.sol";
import "./ICanPayHolders.sol";

contract RCN40Funds is IRCN40Errors, ICanConnectRCN40{

     function canFarmHolders() external view override returns (bool) {
        return true;
    }

    function canRemoveFarm() external view override returns (bool) {
        return true;
    }

    function canPayHolders() external view override returns (bool) {
        return true;
    }

    function ReceiveFarmHolders(address _tokenAddress, uint256 amount) 
    external
     returns (bool)
    {
        IRCN40 tkn = IRCN40(_tokenAddress);

        tkn.farm(amount);

        return true;

    }


    function ReceiveRemoveFarm(address _tokenAddress, uint256 amount)
    external 
    returns (bool)
    {
        IRCN40 tkn = IRCN40(_tokenAddress);

        tkn.removeFarm(amount);
        return true;
    }

    function ReceivePayHolders(address _tokenAddress)
    external 
    {
        IRCN40 tkn = IRCN40(_tokenAddress);

        tkn.payholders();
    }

    function _approve(address _tokenAddress, address protocolApprove, uint256 amount)
    external
    {
       IERC20 tkn = IERC20(_tokenAddress);

       require(tkn.approve(protocolApprove, amount), "Failed to call approve function");
    }
}
