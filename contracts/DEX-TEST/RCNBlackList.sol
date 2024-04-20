// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract RCNBlackList{

    mapping(address => uint8) listPunishments;
    mapping(address => bool) listBlock;

    error RCNProjectBlcoked(bool isBlcok);

    constructor()
    {}


    modifier blackList(address _protocol) {
         _checkBlocks(_protocol);
         _;
    }



    function _checkBlocks(address _protocol) internal virtual {
        if(listBlock[_protocol] == true){
            revert RCNProjectBlcoked(true);
        }
    }



    function punish(address _protocol) internal virtual {
        if(listPunishments[_protocol] >= 3){
            listBlock[_protocol] = true;
        }

        _punish(_protocol);
    }



    function unPunish(address _protocol) internal virtual  {
        if(listPunishments[_protocol] > 0){
            _unPunish(_protocol);
        }
    }



    function _punish(address _protocol) internal virtual {
        listPunishments[_protocol] ++;
    }



    function _unPunish(address _protocol) internal virtual {
        listPunishments[_protocol] = 0;
        listBlock[_protocol] = false;
    }



    function punishes(address _protocol) public view returns(bool){
        return listBlock[_protocol];
    }
}