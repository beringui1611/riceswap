// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IUniswapV3Positions
{
  
    event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);


    function positions(uint256 tokenId)
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );

    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    struct IncreaseLiquidityParams {
        uint256 tokenId;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }


    function increaseLiquidity(IncreaseLiquidityParams calldata params)
        external
        payable
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    struct DecreaseLiquidityParams {
        uint256 tokenId;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }


    function decreaseLiquidity(DecreaseLiquidityParams calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1);

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }

    function collect(CollectParams calldata params) external payable returns (uint256 amount0, uint256 amount1);

   
    function burn(uint256 tokenId) external payable;
}


interface IUniswapV3Factory {
   function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool);

    function setOwner(address _owner) external;

    function enableFeeAmount(uint24 fee, int24 tickSpacing) external ;

}

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract RiceCoin is ERC20{
    IUniswapV3Factory uniswapFactory = IUniswapV3Factory(0x0227628f3F023bb0B980b67D528571c95c6DaC1c);
    IUniswapV3Positions uniswaPositions = IUniswapV3Positions(0x1238536071E1c677A632429e3655c799b22cDA52);

    address owner;



    uint256 tokenId;
    uint128 liquidity;
    uint256 amount0;
    uint256 amount1;
     
    mapping(address => mapping(address => address)) public pairs;

    event TransferredOwner(address indexed oldOwner, address indexed newOwner);


    constructor()ERC20("RiceCoin", "RCN"){
        _mint(msg.sender, 1_360_450_000 *10 **decimals());
        owner = msg.sender;
    }

   
    function createPool(address tokenA, address tokenB, uint24 fee) external onlyOwner {
        if(address(tokenA) == address(0)) revert();
        if(address(tokenB) == address(0)) revert();
        if(fee <= 0) revert();

        address pool = uniswapFactory.createPool(
            tokenA, 
            tokenB, 
            fee
        );

        pairs[tokenA][tokenB] = pool;


    }

    function mintPosition(address tokenA, address tokenB) external {
        IUniswapV3Positions.MintParams memory params = IUniswapV3Positions.MintParams({
            token0: tokenA,
            token1: tokenB,
            fee: 3000, 
            tickLower: -10000, 
            tickUpper: 10000, 
            amount0Desired: 200, 
            amount1Desired: 200, 
            amount0Min: 200, 
            amount1Min: 200,
            recipient: msg.sender,
            deadline: block.timestamp
        });

        (uint256 _tokenId, uint128 _liquidity, uint256 _amount0, uint256 _amount1) = uniswaPositions.mint(params);
        
        assembly {
            sstore(tokenId.slot, _tokenId)
            sstore(liquidity.slot, _liquidity)
            sstore(amount0.slot, _amount0)
            sstore(amount1.slot, _amount1)
        }
    }

    function addLiquidity(
        uint256 tokenID, 
        uint256 amount0Desired, 
        uint256 amount1Desired, 
        uint256 amount0Min, 
        uint256 amount1Min, 
        uint256 deadline) 
            external returns(uint256 liq, uint256 tkn0, uint256 tkn1) {
        
        IUniswapV3Positions.IncreaseLiquidityParams memory params = IUniswapV3Positions.IncreaseLiquidityParams({
            tokenId: tokenID,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: amount0Min,
            amount1Min: amount1Min,
            deadline: deadline
        });

        (uint256 _liquidity, uint256 _token0, uint256 _token1) = uniswaPositions.increaseLiquidity(params);

        assembly {
            liq := _liquidity
            tkn0 := _token0
            tkn1 := _token1
        }
    }
    

    function transferOwnership(address newOwner) external onlyOwner {
        address oldOwner;
        assembly {
            oldOwner := caller()
        }

        uniswapFactory.setOwner(newOwner);
        emit TransferredOwner(oldOwner, newOwner);
    }

    function getPairs(address tknA, address tknB) external view returns(address){
        return pairs[tknA][tknB];
    }

    function decimals() public override pure returns(uint8){
        return 18;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you do not permission");
        _;
    }

    
}