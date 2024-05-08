// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IRiceswapV1Errors.sol";
import "../interfaces/IRiceswap20V1Pool.sol";
import "../interfaces/IRiceswap40V1Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract RiceswapV1Router is IRiceswapV1Errors{
    
    /**
    * @dev Communicates with the indicated pool.
    * User transfers to the router contract using the farm function
    * and then the router transfers to the indicated pool on behalf of the user.
    */

    function callbackFarm(
        address pool,
        uint256 amount
        ) external returns(bool){
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);
            IERC20 tkn = IERC20(sspool.token0());

            if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
            if(amount <= 0) revert IRiceswapAmount(amount);

            tkn.transferFrom(msg.sender, address(this), amount);
            tkn.approve(pool, amount);

            sspool.farm(msg.sender, amount);

            return true;
    }

    /**
    * @dev Communicates with the indicated pool to withdraw the specified amount.
    * router makes the request on your behalf and the pool transfers
    * back to your wallet.
    */

    function callbackRemoveFarm(
        address pool, 
        uint256 amount)
         external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);

           if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
            if(amount <= 0) revert IRiceswapAmount(amount);

            sspool.removeFarm(msg.sender, amount);

            return true;
    }

    /**
    * @dev Communicates with the indicated pool. The router
    * calls the pool's payment function on your behalf,
    * and the pool transfers its fees to the wallet specified in the farm.
    */

    function callbackPayholders(
        address pool) 
         external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);

           if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);

            sspool.payholders(msg.sender);

            return true;
    }

    
    /**
    * @dev Communicates with the indicated pool to perform validation.
    * The pool is responsible for handling all fee transfers correctly.
    */

    function callbackValidator(
        address pool, 
        address from) 
         external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);

           if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
           if(from == address(0)) revert IRiceswapAddressZero(from);

            sspool.validator(from, msg.sender);

            return true;
    }

    /**
    * @dev Function responsible for providing liquidity funds to the specified pools.
    */

    function callbackDeposit(
        address pool, 
        uint256 amount) 
          external returns(bool) {
            IRiceswap20V1Pool sspool = IRiceswap20V1Pool(pool);
            IERC20 tkn = IERC20(sspool.token1());

            if(address(pool) == address(0)) revert IRiceswapAddressZero(pool);
            if(amount <= 0) revert IRiceswapAmount(amount);

            tkn.transferFrom(msg.sender, address(this), amount);
            tkn.approve(pool, amount);

            sspool.deposit(amount);

            return true;
    }

    /**
    * @dev RouterV1 was a solution created to prevent malicious delegations. If you check
    * the contract ../libraries/SecurityCall you will see that it is responsible for proving that the caller
    * is a routing smart contract and if it is not, it will verify if the msg.sender is the same as the address
    * passed as a parameter.
    */
   
    function RouterV1() external virtual pure returns(bool){
        return true;
    }
}

