// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract Bank {
    struct Account {
        address owner;
        uint256 balance;
        // TODO: Add the usernameHash field
    }
    mapping(address => Account) public accounts;
    mapping(address => bool) public accountExists;
    mapping(bytes32 => address) public usernames;
    function hashUsername(string memory username) public pure returns (bytes32) {
        // TODO: Implement the hashUsername function
    }
    function createAccount(string memory username) public {
        // TODO: Implement the createAccount function
    }
    function editUsername(string memory username) public {
        // TODO: Implement the editUsername function
    }
    function searchByUsername(string memory username) public view returns (Account memory) {
        // TODO: Implement the searchByUsername function
    }
    function deposit(uint256 amount) public {
        require(accountExists[msg.sender], "Account does not exist");
        accounts[msg.sender].balance += amount;
    }
    function withdraw(uint256 amount) public {
        require(accountExists[msg.sender], "Account does not exist");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        accounts[msg.sender].balance -= amount;
    }
}