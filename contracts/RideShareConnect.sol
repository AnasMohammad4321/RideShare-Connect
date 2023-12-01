// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RideShareConnect {
    address public owner;
    uint public rideCount;

    struct Ride {
        address driver;
        uint availableSeats;
        uint seatPrice;
        bool isActive;
        mapping(address => bool) passengers;
    }

    mapping(uint => Ride) public rides;

    event RideStarted(uint rideId, address driver, uint availableSeats, uint seatPrice);
    event RideBooked(uint rideId, address passenger, uint seatPrice);
    event RideCompleted(uint rideId, address driver, uint totalEarned);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier rideExists(uint _rideId) {
        require(_rideId < rideCount, "Ride does not exist");
        _;
    }

    modifier rideNotActive(uint _rideId) {
        require(!rides[_rideId].isActive, "Ride is already active");
        _;
    }

    modifier rideActive(uint _rideId) {
        require(rides[_rideId].isActive, "Ride is not active");
        _;
    }

    modifier enoughSeatsAvailable(uint _rideId) {
        require(rides[_rideId].availableSeats > 0, "No available seats");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function signUpAsDriver(uint _availableSeats, uint _seatPrice) external {
        // Ensure the user is not already a driver
        require(!rides[rideCount].isActive, "You are already a driver for an active ride");

        Ride storage newRide = rides[rideCount];
        newRide.driver = msg.sender;
        newRide.availableSeats = _availableSeats;
        newRide.seatPrice = _seatPrice;
        newRide.isActive = false;

        rideCount++;

        emit RideStarted(rideCount - 1, msg.sender, _availableSeats, _seatPrice);
    }

    function signUpAsPassenger(uint _rideId) external rideExists(_rideId) rideNotActive(_rideId) enoughSeatsAvailable(_rideId) {
        Ride storage ride = rides[_rideId];
        require(!ride.passengers[msg.sender], "You are already a passenger in this ride");

        ride.passengers[msg.sender] = true;
        ride.availableSeats--;

        emit RideBooked(_rideId, msg.sender, ride.seatPrice);
    }

    function startRide(uint _rideId) external onlyOwner rideExists(_rideId) rideNotActive(_rideId) {
        rides[_rideId].isActive = true;
    }

    function completeRide(uint _rideId) external onlyOwner rideExists(_rideId) rideActive(_rideId) {
        Ride storage ride = rides[_rideId];

        uint totalEarned = ride.availableSeats * ride.seatPrice;
        payable(ride.driver).transfer(totalEarned);

        emit RideCompleted(_rideId, ride.driver, totalEarned);

        // Reset the ride
        delete ride.driver;
        ride.availableSeats = 0;
        ride.seatPrice = 0;
        ride.isActive = false;
    }
}
