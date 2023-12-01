// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RideShare {
    // Define data structures and functions here
    address public owner;
    mapping(address => bool) public drivers;
    
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function addDriver(address _driver) external onlyOwner {
        drivers[_driver] = true;
    }
}
