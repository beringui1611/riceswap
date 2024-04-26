// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract IRiceswapGovernanceErrors {

    error IRiceswapBytesTitleOrDescriptionInvalid(string _title, string _description);
    error IRiceswapProposalCongested(uint8 length);
}

