// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Math {

   /**
    * @dev Standard payment time for all pools
    */
   uint256 month = 30 *24 *60 *60;

    
    /**
    * @dev Calculates the block.timestamp - locked time
    * thus obtaining how long the user has been in seconds
    * time in seconds / 30 days
    * thus obtaining how long the user has been in the farm.
    *
    * Example: X = 60 days
    * Y = 30 days
    * x
    * -----
    * y = 2 Result: 2 months yielding.
    */

    function calcTime(
        uint256 _timeLock
        )internal view returns(uint256)
        {
            uint256 timeInSeconds = block.timestamp - _timeLock;
            uint256 timeInMonth = timeInSeconds / (month);
            uint256 totalAmount = timeInMonth;

            return totalAmount;
        }

    /**
    * @dev Calculates payment fees related to the total amount staked and farming time.
    * Example:
    * pool fee = 1
    *
    * 1000
    * x ---- = 1000
    * 1 / ---- = R: 10 * calcTime()
    * 100
    *
    */

    function calcPayment(
        uint256 _amount,
        uint256 _fee, 
        uint64 _index, 
        uint256 _total) internal pure returns(uint256)
        {
            uint256 txMonth = ((_amount * _fee) / _index) * _total;

            return txMonth;
        }

   /**
    * @dev Calculates fee proposed by the DEX
    *
    * Example: calcPayment() = 10
    *
    * 10 * 5 / 100 = 0.50$
    *
    * USER = 9.5$
    * DEX = 0.50$
    */

    function calcFee(
        uint256 _monthAmount, 
        uint256 _dexFee) 
        internal pure returns(uint256)
        {
            uint256 txFee = ((_monthAmount * _dexFee) / 100);

            return txFee;
        }
    
    /**
    * @dev calculates validation fee
    * ex: calcMonth() = 10
    * txMonth * 10 / 100 = 1$
    * R: USER = 8.5$
    * DEX = 0.50$
    * VALIDATOR = 1$
    */

    function calcValidator(
        uint256 _txMonth
        ) internal pure returns(uint256) 
        {
            uint256 txValidator = ((_txMonth * 10) / 100);

            return txValidator;
        }

    
}