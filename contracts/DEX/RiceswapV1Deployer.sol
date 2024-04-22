// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Riceswap20V1Pool.sol";

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
        uint8 dexFee;
    }

    Parameters public parameters;


    function deploy(
        address factory,
        address token0,
        address token1,
        address admin,
        uint256 time,
        uint16 fee,
        uint64 index,
        uint8 dexFee
    ) internal returns(address pool) 
    {
        parameters = Parameters({factory: factory, token0: token0, token1: token1, admin: admin, time: time, fee: fee, index: index, dexFee: dexFee});
        bytes32 salt = keccak256(abi.encode(token0, token1, fee));
        RiceswapV1Pool newPool = new RiceswapV1Pool{salt: salt}(
            factory,
            token0,
            token1,
            admin,
            time,
            fee,
            index,
            dexFee
        );
        pool = address(newPool);
        delete parameters;
    }

}
