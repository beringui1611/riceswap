// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Riceswap20V1Pool.sol";
import "./Riceswap40V1Pool.sol";

contract RiceswapV1Deployer {

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


    function deploy(
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
