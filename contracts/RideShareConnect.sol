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

    // Function to sign up as a customer
    function signupCustomer(string memory _username, string memory _password) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");
        require(users[msg.sender].isDriver == false, "Already signed up as a driver");

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

    // Function to sign up as a driver
    function signupDriver(
        string memory _username,
        string memory _password,
        string memory _carRegistration,
        uint256 _numberOfSeats,
        uint256 _seatPrice
    ) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");
        require(bytes(_carRegistration).length > 0, "Car registration cannot be empty");
        require(_numberOfSeats > 0, "Number of seats must be greater than 0");
        require(_seatPrice > 0, "Seat price must be greater than 0");
        require(users[msg.sender].isDriver == false, "Already signed up as a customer");

        users[msg.sender] = User({
            isDriver: true,
            username: _username,
            password: _password,
            carRegistration: _carRegistration,
            numberOfSeats: _numberOfSeats,
            seatPrice: _seatPrice
        });

        emit UserSignup(msg.sender, _username, true);
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
