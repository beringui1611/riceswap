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

    uint256 public btcPrice = 62516;
    uint256 public ethPrice = 3019;
    uint256 public bnbPrice = 596;
    uint256 public solPrice = 150;
    uint256 public usdtPrice = 1;
    uint256 public usdcPrice = 1;

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

    function getFeedBnb() external returns(uint256) {
        
        (
            ,int feed,,,
        ) = bnb.latestRoundData();

        uint256 newFeed = uint256(feed / 1e8);

        assembly {
            sstore(bnbPrice.slot, newFeed)
        }

        return newFeed;
    }

    function getFeedSol() external returns(uint256) {

        (
            ,int feed,,,
        ) = sol.latestRoundData();

        uint256 newFeed = uint256(feed / 1e8);

        assembly {
            sstore(solPrice.slot, newFeed)
        }

        return newFeed;
    }

    function getFeedUsdt() external returns(uint256) {

        (
            ,int feed,,,
        ) = usdt.latestRoundData();

        uint256 newFeed = uint256(feed / 1e8);

        assembly {
            sstore(usdtPrice.slot, newFeed)
        }

        return newFeed;
    }

    function getFeedUsdc() external returns(uint256) {

        (
            ,int feed,,,
        ) = usdc.latestRoundData();

        uint256 newFeed = uint256(feed / 1e8);

        assembly {
            sstore(usdcPrice.slot, newFeed)
        }

        return newFeed;
    }
    
}



