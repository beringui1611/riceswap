// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

 abstract contract RCNOwnable {

    address public _owner;
    mapping(address => bool) _admins;

    error OwnableInvalidAddress(address owner);

    error OwnableInvalidOwner(address owner);

    error OwnableUnauthorizedAccount(address owner);

    error AdminInvalidAddress(address owner);

    error AdminUnauthorizedAccount(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    event AdminTransferred(address indexed newAdmin, bool indexed isAdmin);


    constructor(address _initialOwner)
    {
        if(_initialOwner == address(0))
        {
            revert OwnableInvalidAddress(_initialOwner);
        }

        _transferOwnership(_initialOwner);
    }


    modifier onlyOwner(){
        _checkOwner();
        _;
    }


    modifier onlyAdmin() {
        _checkAdmin();
        _;
    }


     function owner() public view virtual returns (address) {
        return _owner;
    }


    function _checkOwner() internal view virtual {
        if(owner() != msg.sender){
            revert  OwnableUnauthorizedAccount(msg.sender);
        }
    }


    function _checkAdmin() internal view virtual {
       require(_admins[msg.sender] == true|| msg.sender == owner(), "ADMIN");
    }



    function transferOwnership(address newOwner) public virtual onlyOwner {
        if(newOwner == address(0)){
            revert  OwnableInvalidOwner(address(0));
        }

        _transferOwnership(newOwner);
    }


    function transferAdmin(address newAdmin) public virtual onlyOwner {
        if(newAdmin == address(0)){
            revert AdminInvalidAddress(newAdmin);
        }

        _transferAdmin(newAdmin);
    }



    function unTransferAdmin(address oldAdmin) public virtual onlyOwner {
        if(oldAdmin == address(0)){
            revert AdminInvalidAddress(oldAdmin);
        }

        _unstransferAdmin(oldAdmin);
    }


     function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    
    function _transferAdmin(address newAdmin) internal virtual {
        _admins[newAdmin] = true;
        emit AdminTransferred(newAdmin, true);
    }

    

    function _unstransferAdmin(address oldAdmin) internal virtual {
        _admins[oldAdmin] = false;
        emit AdminTransferred(oldAdmin, false);
    }
}

