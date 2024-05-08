// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./DEX-TOKENIZATION/Riceswap20V1Pool.sol";
import "./DEX-TOKENIZATION/Riceswap40V1Pool.sol";
import "./DEX-PRESALES/RiceswapV1Saller.sol";

contract RiceswapV1Deployer {

    /**
     @notice Parameters used for deployment
     @param Factory --> Pool factory address.
     @param Token0 --> Token0 is the main token that will be used for farm.
     @param Token1 --> Token used for monthly payments to holders, for example (USDT).
     @param Admin --> Saves the address of the msg.sender who created the pool.
     @param Time --> Unit of measurement for the time of payment to holders.
     @param Fee --> Percentage of monthly payment to investors
     @param Index --> Index -> Percentage indicator index example: (1000 * 1 / 100 = 1%) or (1000 * 1 / 1000 = 0.10%)
     */
    
    struct Parameters 
    {
        address factory;
        address token0;
        address token1;
        address owner;
        address dexWallet;
        uint256 time;
        uint16 fee;
        uint64 index;
    }

    struct PreSale
    {
        address owner;
        uint256 range;
        uint16 price;
        address token0;
        address token1;
        address factory;
        address dexWallet;
    }

    struct Order 
    {
        address owner;
        address token0;
        address token1;
        int128 min;
        int128 max;
        uint256 quantity;
        address dexWallet;
        address factory;
    }

    Order public paramsOrder;
    PreSale public presaleParams;
    Parameters public parameters;



    /**
     @notice Deployment function fixed income -- RCN20 -- 
     @dev It should receive the expected parameters and deploy a new pool 
     with the received information, noting that it only deploys the RCN20 fixed income here.
     */

    function deploy(
        address factory, 
        address token0,
        address token1,
        address owner,
        address dexWallet,
        uint256 time,
        uint16 fee,
        uint64 index
    ) internal returns(address pool) 
    {
        parameters = Parameters({factory: factory, token0: token0, token1: token1, owner: owner, dexWallet : dexWallet, time: time, fee: fee, index: index});
        bytes32 salt = keccak256(abi.encode(token0, token1, fee));
        Riceswap20V1Pool newPool = new Riceswap20V1Pool{salt: salt}(
            factory,
            token0,
            token1,
            owner,
            dexWallet,
            time,
            fee,
            index
        );
        pool = address(newPool);
        delete parameters;
    }

    /**
     @notice Deployment function variable income -- RCN40 -- 
     @dev It should receive the expected parameters and deploy a new pool 
     with the received information, noting that it only deploys the RCN20 fixed income here.
     */

    function deploy40(
        address factory,
        address token0,
        address token1,
        address owner,
        address dexWallet,
        uint256 time,
        uint16 fee,
        uint64 index
    ) internal returns(address pool) 
    {
        parameters = Parameters({factory: factory, token0: token0, token1: token1, owner: owner, dexWallet: dexWallet, time: time, fee: fee, index: index});
        bytes32 salt = keccak256(abi.encode(token0, token1, fee));
        Riceswap40V1Pool newPool = new Riceswap40V1Pool{salt: salt}(
            factory,
            token0,
            token1,
            owner,
            dexWallet,
            time,
            fee,
            index
        );
        pool = address(newPool);
        delete parameters;
    }

    function deployPresale(
        address owner, 
        uint256 range, 
        uint16 price, 
        address token0, 
        address token1, 
        address factory,
        address dexWallet
        ) internal returns(address presale) {
            presaleParams = PreSale({owner: owner, range: range, price: price, token0: token0, token1: token1, factory: factory, dexWallet: dexWallet});
            bytes32 salt = keccak256(abi.encode(token0, token1, range));
            RiceswapV1Saller newPresale = new RiceswapV1Saller{salt: salt}(
                owner,
                range,
                price,
                token0,
                token1,
                factory,
                dexWallet
            );

           presale = address(newPresale);
           delete presale;
        }

        // function deployOrder(
        //     address owner,
        //     address token0, 
        //     address token1, 
        //     int128 min, 
        //     int128 max, 
        //     uint256 quantity,
        //     address dexWallet,
        //     address factory
        //     ) external returns(address order){
        //         paramsOrder = Order({owner: owner, token0: token0, token1: token1, min: min, max: max, quantity: quantity, dexWallet: dexWallet, factory: factory});
        //         bytes32 salt = keccak256(abi.encode(token0, token1, min, max));
        //     }

}
