// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Validators {


     struct Validator 
     {
        address wallet;
        uint256 time;
        uint256 balance;
     }

      mapping(address => Validator[]) public validators;


      function getValidatorIndexValue(Validator[] storage validatorSchema, address _wallet) internal view returns(uint256){
        for(uint i; i < validatorSchema.length; ++i){
            if(validatorSchema[i].wallet == _wallet)
            {
                return i;
            }
        }

        return validatorSchema.length;
     }

     function increaseValidator(address _token0, uint256 _amount, uint256 _time) internal {
        Validator[] storage validatorsSchema = validators[_token0];
        uint validatorIndex = getValidatorIndexValue(validatorsSchema, msg.sender);

        if (validatorIndex < validatorsSchema.length) {
        validatorsSchema[validatorIndex].time = _time;
        validatorsSchema[validatorIndex].balance += _amount;
        }else {
        Validator memory newValidator = Validator({
            wallet: msg.sender,
            time: _time,
            balance: _amount
        });
        validatorsSchema.push(newValidator);
       }
    }


    function decreaseValidation(address _token0, uint256 _amount, uint256 _time) internal {
        Validator[] storage validatorsSchema = validators[_token0];
        uint validatorIndex = getValidatorIndexValue(validatorsSchema, msg.sender);

        if (validatorIndex < validatorsSchema.length) {
        validatorsSchema[validatorIndex].time = _time;
        validatorsSchema[validatorIndex].balance -= _amount;
        }
    }

     function _checkValidators(address _token0) public view returns(Validator[] memory){
        return validators[_token0];
    }


}