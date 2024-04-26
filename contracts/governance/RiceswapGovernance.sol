// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "./interfaces/IRiceswapGovernanceErrors.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RiceswapGovernance is IRiceswapGovernanceErrors{

    enum Vote 
    {
        YES,
        NO, 
        NULL
    }

    struct Counters
    {
        uint256 yes;
        uint256 no;
        uint256 _null;
    }

    struct ProposalData 
    {
        uint256 id;
        string title;
        string description;
        uint256 createdAt;
        uint256 finished;
        address proposer;
        Counters counters;
        bytes32 hash;
    }

    struct Executed
    {
        string title;
        bool isApprove;
        bool done;
    }

    address owner;
    IERC20 token;
    uint8 id = 0;
    uint64 percentForApprove;
    ProposalData[] public proposalData;
    
    mapping(bytes32 => Executed) public executeds;


    constructor(address _token0, uint64 _percent)
    {
        owner = msg.sender;
        token = IERC20(_token0);
        percentForApprove = _percent;
    }



    function initProposal(
        string memory title,
        string memory description
            ) external {
            
            if(bytes(title).length == 0 || bytes(description).length == 0){
                revert IRiceswapBytesTitleOrDescriptionInvalid(title, description);
            }

            if(proposalData.length > 3) revert IRiceswapProposalCongested(3);

            bytes32 _hash = keccak256(abi.encode(title, description, msg.sender, block.timestamp));
            
            proposalData.push(ProposalData({
                id:id++,
                title: title,
                description: description,
                createdAt: block.timestamp,
                finished: 10 *24 *60 *60,
                proposer: msg.sender,
                counters:Counters(0,0,0),
                hash: _hash
            }));
    }

    function vote(uint8 _id, uint8 _vote) external {
        ProposalData storage proposal = proposalData[_id];
        
        if(block.timestamp >= proposal.createdAt + proposal.finished) revert();
        //if(token.balanceOf(msg.sender) < 0) revert();
        if(_vote > 2) revert();

        if(_vote == uint8(Vote.YES)){
            proposal.counters.yes++;
        }
        else if(_vote == uint8(Vote.NO)){
            proposal.counters.no++;
        }
        else {
            proposal.counters._null++;
        }
    }

    function closeVote(uint8 _id) external {
        ProposalData storage proposal = proposalData[_id];
        if(block.timestamp > proposal.createdAt + proposal.finished){
             if(proposal.counters.yes > proposal.counters.no){
                 executeds[proposal.hash] = Executed({title: proposal.title, isApprove: true, done: false});
                 delete proposalData[_id];
             }
             else if(proposal.counters.no > proposal.counters.yes){
                 executeds[proposal.hash] = Executed({title: proposal.title, isApprove: false, done: false});
                 delete proposalData[_id];
             }
             else if(proposal.counters.no == proposal.counters.yes){
                proposal.finished = 3 * 24 *60 *60;
             }
             else if(proposal.counters.yes + proposal.counters.no + proposal.counters._null < percentForApprove){
                proposal.finished = 3 * 24 *60 *60;
             }
             else if(proposal.counters._null > proposal.counters.yes + proposal.counters.no){
                delete proposalData[_id];
                delete executeds[proposal.hash];
             }
        }
        else 
        {
            revert();
        }
    }

    function getProposal() external view returns(ProposalData[] memory){
        return proposalData;
    }

}