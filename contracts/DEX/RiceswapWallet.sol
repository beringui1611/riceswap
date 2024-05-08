// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract RiceswapWallet {

    error RiceswapZeroAddress(address zero);
    error RiceswapInsufficientBalance(uint256 amount);
    error RiceswapAmountInvalid(uint256 amount);

    //----------------------------- ENDEREÇOS TESTES --------------------------------//
    address public riceswap = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; //50%
    address public nextchain = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; //30%
    address public marketing = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65; //10%
    address public donations =  0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc; //10%

    mapping(address => mapping(address => uint256)) public balanceOf;


    function withdraw(address tokne0, uint256 amount) external onlyWallet {
        IERC20 tkn0 = IERC20(tokne0);
        address wallet = identifier(msg.sender);
        console.log(wallet);


        if(address(tokne0) == address(0)) revert RiceswapZeroAddress(tokne0);
        if(amount <= 0) revert RiceswapAmountInvalid(amount);
        if(balanceOf[wallet][tokne0] < amount) revert RiceswapInsufficientBalance(amount);

        tkn0.transfer(wallet, amount);
        balanceOf[wallet][tokne0] -= amount;
        
    }

    function receiver(uint256 amount, address tokenReceiver) external virtual returns(bool){
        IERC20 tknReceiver = IERC20(tokenReceiver);

        if(address(tokenReceiver) == address(0)) revert RiceswapZeroAddress(tokenReceiver);
        if(amount <= 0) revert RiceswapAmountInvalid(amount);

        tknReceiver.transferFrom(msg.sender, address(this), amount);

        uint256 txrcs = amount * 50 / 100;
        uint256 txnxt = amount * 30 / 100;
        uint256 txmkt = amount * 10 / 100;
        uint256 txdns = amount * 10 / 100;

        balanceOf[riceswap][tokenReceiver] += txrcs;
        balanceOf[nextchain][tokenReceiver] += txnxt;
        balanceOf[marketing][tokenReceiver] += txmkt;
        balanceOf[donations][tokenReceiver] += txdns;

        return true;
    }


    function identifier(address wallet) internal virtual returns(address ret){
        if(wallet == nextchain){
            assembly {
                ret := sload(nextchain.slot)
            }
        }
        else if(wallet == riceswap){
            assembly {
                ret := sload(riceswap.slot)
            }
        }
        else if(wallet == marketing){
            assembly {
                ret := sload(marketing.slot)
            }
        }
        else if(wallet == donations){
            assembly {
                ret := sload(donations.slot)
            }
        }
    }

    function changeWallet(address newAddress) external onlyWallet {
        if(msg.sender == nextchain){
            assembly {
                sstore(nextchain.slot, newAddress )
            }
        }
        else if(msg.sender == riceswap){
            assembly {
                sstore(riceswap.slot, newAddress)
            }
        }
        else if(msg.sender == marketing){
            assembly {
                sstore(marketing.slot, newAddress)
            }
        }
        else if(msg.sender == donations){
            assembly {
                sstore(donations.slot, newAddress)
            }
        }
        else
        {
            revert();
        }
    }


    modifier onlyWallet {
        require(
            msg.sender == riceswap  ||
            msg.sender == nextchain ||
            msg.sender == marketing || 
            msg.sender == donations,
            "WALLET ERROR"
            );

        _;
    }

}