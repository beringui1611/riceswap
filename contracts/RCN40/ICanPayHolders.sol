
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICanConnectRCN40 {
    
    function canPayHolders() external returns(bool);

    function canFarmHolders() external returns(bool);

    function canRemoveFarm() external returns(bool);

}