// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RideShareConnect {
    // Define a struct to represent user data
    struct User {
        bool isDriver;
        string username;
        string password;
        string carRegistration;
        uint256 numberOfSeats;
        uint256 seatPrice;
    }

    // Define a struct to represent ride data
    struct Ride {
        uint256 rideID;
        string driverID;
        bool isGoing;
    }

    // Mapping to store user data
    mapping(address => User) public users;

    // Mapping to store ride data
    mapping(uint256 => Ride) public rides;

    // Event to log user signup
    event UserSignup(
        address indexed userAddress,
        string username,
        bool isDriver
    );

    // Event to log ride start
    event RideStarted(uint256 rideID, string driverID);

    /// Function to sign up as a customer
    function signupCustomer(
        string memory _username,
        string memory _password
    ) public {
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

    /// Function to start a ride as a driver
    function startRide(
        string memory _username,
        string memory _carRegistration,
        uint256 _numberOfSeats,
        uint256 _seatPrice
    ) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(
            bytes(_carRegistration).length > 0,
            "Car registration cannot be empty"
        );
        require(_numberOfSeats > 0, "Number of seats must be greater than 0");
        require(_seatPrice > 0, "Seat price must be greater than 0");
        require(!users[msg.sender].isDriver, "User is already a driver");

        users[msg.sender] = User({
            isDriver: true,
            username: _username,
            password: users[msg.sender].password,
            carRegistration: _carRegistration,
            numberOfSeats: _numberOfSeats,
            seatPrice: _seatPrice
        });

        uint256 rideID = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        rides[rideID] = Ride({
            rideID: rideID,
            driverID: _username,
            isGoing: false
        });

        emit UserSignup(msg.sender, _username, true);
        emit RideStarted(rideID, _username);
    }

    // Event to log ride booking
    event RideBooked(uint256 rideID, string, uint256 seatsBooked);

    /// Function to book a ride
    function bookRide(
        string memory _username,
        uint256 _seatsRequired,
        uint256 _rideID
    ) public {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(
            _seatsRequired > 0,
            "Number of seats required must be greater than 0"
        );

        // Ensure the user is a customer (not a driver)
        // require(!users[msg.sender].isDriver, "Drivers cannot book rides");

        // Get ride details
        // Ride storage ride = rides[_rideID];

        // Ensure the ride exists and is not already booked
        // require(ride.rideID != 0, "Ride does not exist");
        // require(!ride.isGoing, "Ride is already booked");

        // Ensure there are enough available seats
        // require(
        //     _seatsRequired <= users[msg.sender].numberOfSeats,
        //     "Not enough available seats"
        // );

        // Book the ride
        // ride.isGoing = true;

        // Emit event for ride booking
        emit RideBooked(_rideID, _username, _seatsRequired);
    }

    // Event to log ride cancellation
    // event RideCanceled(uint256 indexed rideID, string driverID);
    event RideCanceled(string driverID);

    /// Function to cancel a ride
    function cancelRide() public {
        // Ensure the sender is the driver who started the ride
        // require(
        //     rides[_rideID].driverID == users[msg.sender].username,
        //     "Only the driver can cancel the ride"
        // );

        // // Ensure the ride exists
        // require(rides[_rideID].rideID != 0, "Ride does not exist");

        // // Ensure the ride is not already booked
        // require(!rides[_rideID].isGoing, "Ride is already booked");

        // // Cancel the ride
        // delete rides[_rideID];

        // Emit event for ride cancellation
        // emit RideCanceled(_rideID, users[msg.sender].username);
        emit RideCanceled(users[msg.sender].username);
    }

    // Function to sign in
    function signin(
        string memory _username,
        string memory _password
    ) public view returns (bool) {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_password).length > 0, "Password cannot be empty");

        User storage user = users[msg.sender];
        return
            keccak256(bytes(user.username)) == keccak256(bytes(_username)) &&
            keccak256(bytes(user.password)) == keccak256(bytes(_password));
    }
}
