// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Truffle automatically detects and runs migrations
// This contract ensures that only one migration is executed at a time
contract Migrations {
    address public owner = msg.sender;
    uint256 public last_completed_migration;

    modifier restricted() {
        require(msg.sender == owner, "This function can only be called by the owner");
        _;
    }

    function setCompleted(uint256 completed) external restricted {
        last_completed_migration = completed;
    }
}
