// app.js
document.addEventListener('DOMContentLoaded', function () {
    initWeb3();
    loadRides();
});

async function initWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    } else {
        console.error('No web3 provider detected');
    }
}

async function startRide() {
    const rideContract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    try {
        const accounts = await web3.eth.getAccounts();
        await rideContract.methods.startRide(3, web3.utils.toWei('0.1', 'ether')).send({ from: accounts[0] });
        loadRides();
    } catch (error) {
        console.error('Error starting ride:', error);
    }
}

async function loadRides() {
    const rideContract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const rideCount = await rideContract.methods.rideCount().call();

    const ridesList = document.getElementById('ridesList');
    ridesList.innerHTML = '';

    for (let i = 0; i < rideCount; i++) {
        const ride = await rideContract.methods.rides(i).call();
        const rideElement = document.createElement('div');
        rideElement.innerHTML = `<p>Ride ID: ${i}</p>
                                 <p>Driver: ${ride.driver}</p>
                                 <p>Available Seats: ${ride.availableSeats}</p>
                                 <p>Seat Price: ${web3.utils.fromWei(ride.seatPrice, 'ether')} ETH</p>
                                 <button onclick="bookRide(${i}, ${ride.seatPrice})">Book Ride</button>`;
        ridesList.appendChild(rideElement);
    }
}

async function bookRide(rideId, seatPrice) {
    const rideContract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    try {
        const accounts = await web3.eth.getAccounts();
        await rideContract.methods.bookRide(rideId).send({ from: accounts[0], value: seatPrice });
        loadRides();
    } catch (error) {
        console.error('Error booking ride:', error);
    }
}
