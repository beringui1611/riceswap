// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

interface AggregatorV3Interface {
  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(
    uint80 _roundId
  ) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);

  function latestRoundData()
    external
    view
    returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED
 * VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

/**
 * If you are reading data feeds on L2 networks, you must
 * check the latest answer from the L2 Sequencer Uptime
 * Feed to ensure that the data is accurate in the event
 * of an L2 sequencer outage. See the
 * https://docs.chain.link/data-feeds/l2-sequencer-feeds
 * page for details.
 */

contract DataConsumerV3 {
    AggregatorV3Interface internal btc;
    AggregatorV3Interface internal eth;

    int btcPrice;
    int ethPrice;

    struct Tokens 
    {
        address _owner;
        uint256 _quantity;
        int _price;
    }

    struct Pairs
    {
        address _pair;
        int _price;
    }

    mapping(address => Tokens) order;
    mapping(address => Pairs) pairs;

    error RCNInsufficientAmount(uint256 amount);

    error RCNAllowance(uint256 amount);

    constructor() {
        btc = AggregatorV3Interface(
          0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        );

        eth = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    /**
     * Returns the latest answer.
     */
    // BTC LIST
    function getChainlinkDataFeedLatestAnswerBtc() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = btc.latestRoundData();
        return answer / 1e8;
    }

    function setPriceBtcInUsd() external {
        (int price) = getChainlinkDataFeedLatestAnswerBtc();
        btcPrice = price;
        pairs[address(btc)] = Pairs({
            _pair: address(btc),
            _price: price
        });
    }

    function priceBTC() external view returns(int) {
        return btcPrice;
    }
    //FIM BTC 

    //ETH LIST
    function getChainlinkDataFeedLatestAnswerEth() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = eth.latestRoundData();
        return answer / 1e8;
    }

    function setPriceEthInUsd() external {
        (int price) = getChainlinkDataFeedLatestAnswerEth();
        ethPrice = price;
         pairs[address(eth)] = Pairs({
            _pair: address(eth),
            _price: price
        });
    }

    function priceETH() external view returns(int){
        return ethPrice;
    }
    // FIM ETH

    //AREA DE COMPRA 
    function deposit(address _token0) external {
        (uint256 amount) = IERC20(_token0).balanceOf(msg.sender);
        if(amount <= 0){
            revert RCNInsufficientAmount(amount);
        }

        if(IERC20(_token0).allowance(msg.sender, address(this)) < amount){
            revert RCNAllowance(amount);
        }

        IERC20(_token0).transferFrom(msg.sender, address(this), amount);

        order[_token0] = Tokens({
            _owner: msg.sender,
            _quantity: amount,
            _price: 1
        });
    }

    function buy(address _token0, address _token1, uint256 _amount) external {
        if(_amount < 0){
            revert();
        }
        else if(_token1 != pairs[_token1]._pair){
            revert();
        }

    }

    function safeTransfer(address _token0, address _to, address _token1, address _from, uint256 orderBuy, uint256 orderSent) internal virtual {
        Tokens storage _order = order[_token0];

        // if(_token1 == pairs[_token1]._pair){
        //     int value = int(orderBuy) * order[_token0]._price;
        //     uint priceIn = uint(value) / uint(pairs[_token1]._price);

        //     if(IERC20(_token1).allowance(msg.sender, address(this)) < orderBuy) revert();
        //     require(IERC20(_token1).transferFrom(msg.sender, _order._owner, priceIn));
        // } REFAZER --> OLHAR DC 
       

        _order._quantity -= orderBuy;
   
    }
    //FIM AREA DE COMPRA
}
