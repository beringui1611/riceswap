// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IRiceswapV1Router.sol";
import "../interfaces/ISallerV1Router.sol";

contract SecurityCall{

    
    /**
    * @dev Checks if the passed address is a smart contract
    * by retrieving the extcodesize property in assembly.
    */
    function isRouter(address _account) internal view returns(bool) {
        uint256 size;
        assembly {
            size := extcodesize(_account)
        }

        return size > 0;
    }

    /**
    * @dev Modifier for delegation control. This modifier
    * prevents other users from calling functions on behalf of other addresses
    * with the use of a router it would open doors for other malicious users
    * to call functions on behalf of other users, although it wouldn't have a huge impact
    * regarding `scammers`, we can prevent it with this modifier. It checks if it's a router contract
    * or a user and if the calling user is the same address being passed as a parameter.
    */
    modifier noDelegateCall(address _msgSender) {
        if(isRouter(msg.sender)){

            require(
                IRiceswapV1Router(msg.sender).RouterV1(),
                "NO DELEGATE"
            );
        }
        else if(!isRouter(msg.sender)){

            require(_msgSender == msg.sender, 
            "NO DELEGATE"
            );
        }

        _;
    }

    modifier noDelegatePresale(address _msgSender) {
        if(isRouter(msg.sender)){
            require(ISallerV1Router(msg.sender).RouterV1(),
            "NO DELEGATE"
            );
           
        }
        else if(!isRouter(msg.sender)){
            require(_msgSender == msg.sender,
            "NO DELEGATE"
            );
        }

         _;
    }

}