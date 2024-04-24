// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface IRiceswap40V1Pool {

    event Farm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);
    
    event RemoveFarm(address indexed _to, uint256 indexed _amount, uint256 _timestamp);

    event PayHolder(address indexed _to, uint256 indexed _txMonth, uint256 _timestamp);

    event Validator(address indexed _from, uint256 _txMonth, address indexed _validator, uint256 _txValidator);

    event Deposit(address indexed _from, address indexed _to, uint256 _amount);

    function farm(uint256 _amount) external;

    function removeFarm(uint256 _amount) external;

    function payholders() external;

    function validator(address _from) external;

    function deposit(uint256 _amount) external;

    function upgradeableFee(uint16 _newFee) external;

    function upgradeableIndex(uint64 _newIndex) external;
        
}