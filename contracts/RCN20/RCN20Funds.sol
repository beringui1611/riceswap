// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./IRCN20.sol";
import "./IRCN20Error.sol";
import "./ICanPayHolders.sol";

contract RCN20Funds is IRCN20Errors, ICanConnectRCN20{

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
        IRCN20 tkn = IRCN20(_tokenAddress);

        tkn.farm(amount);

        return true;

    }


    function ReceiveRemoveFarm(address _tokenAddress, uint256 amount)
    external 
    returns (bool)
    {
        IRCN20 tkn = IRCN20(_tokenAddress);

        tkn.removeFarm(amount);
        return true;
    }

    function ReceivePayHolders(address _tokenAddress)
    external 
    {
        IRCN20 tkn = IRCN20(_tokenAddress);

        tkn.payholders();
    }

    function _approve(address _tokenAddress, address protocolApprove, uint256 amount)
    external
    {
       IERC20 tkn = IERC20(_tokenAddress);

       require(tkn.approve(protocolApprove, amount), "Failed to call approve function");
    }
}
