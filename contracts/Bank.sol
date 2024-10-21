// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Bank {
    struct Account {
        address owner;
        uint256 balance;
        bytes32 usernameHash; // Added the usernameHash field
    }

    mapping(address => Account) public accounts;
    mapping(address => bool) public accountExists;
    mapping(bytes32 => bool) public usernameTaken; // Added mapping for username uniqueness

    // Function to hash the username
    function hashUsername(string memory username) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(username));
    }

    // Function to create an account with a unique username
    function createAccount(string memory username) public {
        require(!accountExists[msg.sender], "Account already exists");

        // Hash the username
        bytes32 usernameHash = hashUsername(username);

        // Ensure the username is unique
        require(!usernameTaken[usernameHash], "Username already taken");

        // Create the account and set the username hash
        accounts[msg.sender] = Account({
            owner: msg.sender,
            balance: 0,
            usernameHash: usernameHash
        });

        // Mark account as created
        accountExists[msg.sender] = true;

        // Mark the username as taken
        usernameTaken[usernameHash] = true;
    }

    // Function to edit the username, ensuring uniqueness
    function editUsername(string memory newUsername) public {
        require(accountExists[msg.sender], "Account does not exist");

        // Hash the new username
        bytes32 newUsernameHash = hashUsername(newUsername);

        // Ensure the new username is unique
        require(!usernameTaken[newUsernameHash], "Username already taken");

        // Free the old username
        usernameTaken[accounts[msg.sender].usernameHash] = false;

        // Assign the new username hash
        accounts[msg.sender].usernameHash = newUsernameHash;

        // Mark the new username as taken
        usernameTaken[newUsernameHash] = true;
    }

    // Function to search for an account by username
    function searchByUsername(string memory username) public view returns (address) {
        bytes32 usernameHash = hashUsername(username);

        // Search for the account associated with the username
        for (address accountAddress = address(0); accountAddress < address(2**160 - 1); accountAddress++) {
            if (accounts[accountAddress].usernameHash == usernameHash) {
                return accountAddress;
            }
        }

        revert("Account not found");
    }

    // Deposit function (provided in the starter code)
    function deposit(uint256 amount) public {
        require(accountExists[msg.sender], "Account does not exist");
        accounts[msg.sender].balance += amount;
    }

    // Withdraw function (provided in the starter code)
    function withdraw(uint256 amount) public {
        require(accountExists[msg.sender], "Account does not exist");
        require(accounts[msg.sender].balance >= amount, "Insufficient balance");
        accounts[msg.sender].balance -= amount;
    }
}
