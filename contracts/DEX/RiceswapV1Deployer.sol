// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Riceswap20V1Pool.sol";
import "./Riceswap40V1Pool.sol";

contract RiceswapV1Deployer {

    /**
     * @notice Parameters used for deployment
     * @param Factory --> Pool factory address.
     * @param Token0 --> Token0 is the main token that will be used for farm.
     * @param Token1 --> Token used for monthly payments to holders, for example (USDT).
     * @param Admin --> Saves the address of the msg.sender who created the pool.
     * @param Time --> Unit of measurement for the time of payment to holders.
     * @param Fee --> Percentage of monthly payment to investors
     * @param Index --> Index -> Percentage indicator index example: (1000 * 1 / 100 = 1%) or (1000 * 1 / 1000 = 0.10%)
     */
    
    struct Parameters 
    {
        address factory;
        address token0;
        address token1;
        address admin;
        uint256 time;
        uint16 fee;
        uint64 index;
    }

    Parameters public parameters;

    /**
     * @notice Deployment function fixed income -- RCN20 -- 
     * @dev It should receive the expected parameters and deploy a new pool 
     * with the received information, noting that it only deploys the RCN20 fixed income here.
     */

    function deploy(
        address factory, //struct
        address token0,
        address token1,
        address admin,
        uint256 time,
        uint16 fee,
        uint64 index
    ) internal returns(address pool) 
    {
        parameters = Parameters({factory: factory, token0: token0, token1: token1, admin: admin, time: time, fee: fee, index: index});
        bytes32 salt = keccak256(abi.encode(token0, token1, fee));
        Riceswap20V1Pool newPool = new Riceswap20V1Pool{salt: salt}(
            factory,
            token0,
            token1,
            admin,
            time,
            fee,
            index
        );
        pool = address(newPool);
        delete parameters;
    }

    /**
     * @notice Deployment function variable income -- RCN40 -- 
     * @dev It should receive the expected parameters and deploy a new pool 
     * with the received information, noting that it only deploys the RCN20 fixed income here.
     */
    
    function deploy40(
        address factory,
        address token0,
        address token1,
        address admin,
        uint256 time,
        uint16 fee,
        uint64 index
    ) internal returns(address pool) 
    {
        parameters = Parameters({factory: factory, token0: token0, token1: token1, admin: admin, time: time, fee: fee, index: index});
        bytes32 salt = keccak256(abi.encode(token0, token1, fee));
        Riceswap40V1Pool newPool = new Riceswap40V1Pool{salt: salt}(
            factory,
            token0,
            token1,
            admin,
            time,
            fee,
            index
        );
        pool = address(newPool);
        delete parameters;
    }

}
