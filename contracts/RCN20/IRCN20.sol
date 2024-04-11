// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;



interface  IRCN20 {

      struct Validator
    {
        address wallet;
        uint256 time;
    }


    event Deposit(address _owner, uint reserveMoreAmount, uint timeStamp);
    event Withdraw(address _owner, uint reserveLessAmount, uint timeStamp);
    event Payment(address _holder, uint reward, uint256 timeStamp);
    event Validate(address _validate, uint256 _tx, uint256 _timeStamp);
    

    function farm(uint256 amount) external;


    function removeFarm(uint amount) external;


    function payholders() external;


    function getWallets() external view returns(Validator[] memory);
 

    function checkValidator(address _address) external view returns(bool);


    function validate(address _address) external;


    function deposit(uint256 amount) external;


    function withdraw(uint256 amount) external;


    function pause() external;


    function unpause() external;


    function addAdmin(address _admin) external;


    function removeAdmin(address _admin) external;
    

}