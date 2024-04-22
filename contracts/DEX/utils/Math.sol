// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract Math {

    uint256 month = 30 *24 *60 *60;

    function calcTime(
        uint256 _timeLock
        )internal virtual returns(uint256)
        {
            uint256 timeInSeconds = block.timestamp - _timeLock;
            uint256 timeInMonth = timeInSeconds / (month);
            uint256 totalAmount = timeInMonth;

            return totalAmount;
        }

    function calcPayment(
        uint256 _amount,
        uint256 _fee, 
        uint64 _index, 
        uint256 _total) internal virtual returns(uint256)
        {
            uint256 txMonth = ((_amount * _fee) / _index) * _total;

            return txMonth;
        }

    function calcFee(
        uint256 _monthAmount, 
        uint256 _dexFee) 
        internal virtual returns(uint256)
        {
            uint256 txFee = ((_monthAmount * _dexFee) / 100);

            return txFee;
        }

    function calcValidator(
        uint256 _txMonth
        ) internal virtual returns(uint256) 
        {
            uint256 txValidator = ((_txMonth * 10) / 100);

            return txValidator;
        }

    
}