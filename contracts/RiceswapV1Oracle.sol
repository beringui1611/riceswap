//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgreggatorInterface.sol";

contract RiceswapV1Oracle {

    IAgreggatorInterface public btc;
    IAgreggatorInterface public eth;
    IAgreggatorInterface public bnb;
    IAgreggatorInterface public sol;
    IAgreggatorInterface public usdt;
    IAgreggatorInterface public usdc;

    uint256 public btcPrice;
    uint256 public ethPrice;

    constructor(
        address _btc, 
        address _eth, 
        address _bnb, 
        address _sol, 
        address _usdt, 
        address _usdc){
            
            btc = IAgreggatorInterface(_btc);
            eth = IAgreggatorInterface(_eth);
            bnb = IAgreggatorInterface(_bnb);
            sol = IAgreggatorInterface(_sol);
            usdt = IAgreggatorInterface(_usdt);
            usdc = IAgreggatorInterface(_usdc);
        }


    
    function getFeedBtc() external returns(uint256) {
        
        (
            ,int feed,,,
        ) = btc.latestRoundData();

        uint256 newFeed = uint256(feed / 1e8);

        assembly {
            sstore(btcPrice.slot, newFeed)
        }

        return newFeed;
    }

    function getFeedEth() external returns(uint256) {

        (
            ,int feed,,,
        ) = eth.latestRoundData();

        uint256 newFeed = uint256(feed / 1e8);

        assembly {
            sstore(ethPrice.slot, newFeed)
        }

        return newFeed;
    }
}



