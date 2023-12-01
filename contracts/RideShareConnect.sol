// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RideShareConnect {
    struct Ride {
        address driver;
        uint256 availableSeats;
        uint256 seatPrice;
        mapping(address => bool) passengers;
    }

    mapping(uint256 => Ride) public rides;
    uint256 public rideCount;

    event RideStarted(uint256 rideId, address driver, uint256 availableSeats, uint256 seatPrice);
    event RideBooked(uint256 rideId, address passenger);
    event RideCancelled(uint256 rideId, address canceller);

    function startRide(uint256 _availableSeats, uint256 _seatPrice) external {
        require(_availableSeats > 0, "Invalid number of seats");
        require(_seatPrice > 0, "Invalid seat price");

        Ride storage newRide = rides[rideCount];
        newRide.driver = msg.sender;
        newRide.availableSeats = _availableSeats;
        newRide.seatPrice = _seatPrice;

        emit RideStarted(rideCount, msg.sender, _availableSeats, _seatPrice);
        rideCount++;
    }

    function bookRide(uint256 _rideId) external payable {
        require(_rideId < rideCount, "Ride does not exist");
        Ride storage ride = rides[_rideId];
        require(ride.availableSeats > 0, "No available seats");
        require(msg.value == ride.seatPrice, "Incorrect payment amount");
        require(!ride.passengers[msg.sender], "Already booked");

        ride.passengers[msg.sender] = true;
        ride.availableSeats--;

        emit RideBooked(_rideId, msg.sender);
    }

    function cancelBooking(uint256 _rideId) external {
        require(_rideId < rideCount, "Ride does not exist");
        Ride storage ride = rides[_rideId];
        require(ride.passengers[msg.sender], "Not booked on this ride");

        ride.passengers[msg.sender] = false;
        ride.availableSeats++;

        emit RideCancelled(_rideId, msg.sender);
    }
}
