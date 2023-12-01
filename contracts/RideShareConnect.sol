// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RideShareConnect {
    // Define a struct to represent user data
    struct User {
        bool isDriver;
        string username;
        string password; // Note: In a production environment, passwords should be securely hashed.
        string carRegistration;
        uint256 numberOfSeats;
        uint256 seatPrice;
    }

    // Mapping to store user data
    mapping(address => User) public users;

    // Event to log user signup
    event UserSignup(address indexed userAddress, string username, bool isDriver);

    /// Function to sign up as a customer
    function signupCustomer(string memory _username, string memory _password) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");

        users[msg.sender] = User({
            isDriver: false,
            username: _username,
            password: _password,
            carRegistration: "",
            numberOfSeats: 0,
            seatPrice: 0
        });

        emit UserSignup(msg.sender, _username, false);
    }


    // Function to sign in
    function signin(string memory _username, string memory _password) public view returns (bool) {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");

        User storage user = users[msg.sender];
        return keccak256(bytes(user.username)) == keccak256(bytes(_username)) &&
               keccak256(bytes(user.password)) == keccak256(bytes(_password));
    }
}
