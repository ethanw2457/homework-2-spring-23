// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Bank {
    struct Account {
        address owner;
        uint256 balance;
        bytes32 usernameHash; 
    }

    mapping(address => Account) public accounts;
    mapping(address => bool) public accountExists;
    mapping(bytes32 => bool) public usernameTaken; 

    function hashUsername(string memory username) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(username));
    }

    function createAccount(string memory username) public {
        require(!accountExists[msg.sender], "Account already exists");

        bytes32 usernameHash = hashUsername(username);

        require(!usernameTaken[usernameHash], "Username already taken");

        accounts[msg.sender] = Account({
            owner: msg.sender,
            balance: 0,
            usernameHash: usernameHash
        });

        accountExists[msg.sender] = true;

        usernameTaken[usernameHash] = true;
    }

    function editUsername(string memory newUsername) public {
        require(accountExists[msg.sender], "Account does not exist");

        bytes32 newUsernameHash = hashUsername(newUsername);

        require(!usernameTaken[newUsernameHash], "Username already taken");

        usernameTaken[accounts[msg.sender].usernameHash] = false;

        accounts[msg.sender].usernameHash = newUsernameHash;

        usernameTaken[newUsernameHash] = true;
    }

    function searchByUsername(string memory username) public view returns (address) {
        bytes32 usernameHash = hashUsername(username);

        for (address accountAddress = address(0); accountAddress < address(2**160 - 1); accountAddress++) {
            if (accounts[accountAddress].usernameHash == usernameHash) {
                return accountAddress;
            }
        }

        revert("Account not found");
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
