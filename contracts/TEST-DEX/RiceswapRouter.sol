// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface IRiceswapRouter {
    function farm(
        address _msgSender,
        uint256 _amount
        ) external;

        
    function removeFarm(
        address _msgSender,
        uint256 _amount
        ) external;


    function payholders(address _msgSender) 
    external;


      function validator(
        address _from,
        address _msgSender
        ) external;

         
}

contract RiceswapRouter {


    function CallBackFarm(address pool, address token0, uint256 amount) external {
        IERC20(token0).approve(pool, amount);
        IERC20(token0).transferFrom(msg.sender, address(this), amount);
        IRiceswapRouter(pool).farm(msg.sender, amount);
    }

    
    function CallBackRemoveFarm(address pool, uint256 amount) external {
        IRiceswapRouter(pool).removeFarm(msg.sender, amount);
    }

     function CallBackPayholders(address pool) external {
        IRiceswapRouter(pool).payholders(msg.sender);
    }

    function CallBackValidator(address pool, address from) external {
        IRiceswapRouter(pool).validator(from, msg.sender);
    }

}