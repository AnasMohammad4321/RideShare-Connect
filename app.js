
let rideID = 1;

App = {
    loading: false,
    contracts: {},
    account: null,
    username: null,

    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();

        // Listen for MetaMask account changes
        ethereum.on('accountsChanged', App.handleAccountChange);
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);
        } else {
            window.alert("Please connect to Metamask.");
        }
    
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                await ethereum.enable();
                // web3.eth.sendTransaction({/* ... */}); // Commented out, not necessary
            } catch (error) {
                console.error('User denied account access:', error);
            }
        } else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);
            // web3.eth.sendTransaction({/* ... */}); // Commented out, not necessary
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    },
    

    handleAccountChange: async () => {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts[0];
        // Handle any UI updates or logic needed when the account changes
        App.render();
    },

    loadAccount: async () => {
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0];
    },

    loadContract: async () => {
        try {
            // Load your smart contract here using its ABI and address
            const response = await fetch('build/contracts/RideShareConnect.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch contract data (${response.status} ${response.statusText})`);
            }
    
            const contractData = await response.json();
            const abi = contractData.abi; // Ensure ABI is present in your JSON file
            const networks = contractData.networks;
            const networkId = Object.keys(networks)[0]; // Assuming there is only one network
    
            const RideShareConnectContract = new web3.eth.Contract(abi, networks[networkId].address);
            App.contracts.RideShareConnect = { abi, address: networks[networkId].address }; // Store ABI along with the contract address
        } catch (error) {
            console.error('Error loading contract:', error);
        }
    },                    
    
    render: async () => {
        const welcomeScreen = document.getElementById('authSection');
        welcomeScreen.style.display = 'block';
        // App.signupCustomer();
    },    
    

    signupCustomer: async () => {
        try {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
    
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const selectedAccount = accounts[0];
    
            if (!username || !password) {
                console.error('Username or password is empty');
                return;
            }
    
            // Use the ABI directly from the loaded contract
            const RideShareConnectContract = new web3.eth.Contract(App.contracts.RideShareConnect.abi, App.contracts.RideShareConnect.address);
    
            // Assuming your contract has a method named signupCustomer
            await RideShareConnectContract.methods.signupCustomer(username, password).send({ from: selectedAccount });
    
            console.log('User signed up as customer:', username);
    
            // Update account and username
            App.account = selectedAccount;
            App.username = username;
    
            // Render the welcome screen with a success message
            await App.renderWelcomeScreen('Signup successful!');
        } catch (error) {
            console.error('Error during signup:', error);
            // Render the welcome screen with an error message
            await App.renderSignUpFailedScreen('Signup failed. Please try again.');
        }
    },            


    signin: async () => {
        try {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
    
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            App.account = accounts[0];
            App.username = username;
            // Use the ABI directly from the loaded contract
            const RideShareConnectContract = new web3.eth.Contract(App.contracts.RideShareConnect.abi, App.contracts.RideShareConnect.address);
    
            // Call the `signin` method in the smart contract
            const isSignedIn = await RideShareConnectContract.methods.signin(username, password).call({ from: App.account });
    
            if (isSignedIn) {
                console.log('User signed in:', username);
                // Call renderWelcomeScreen or any other logic
                await App.renderWelcomeScreen('Login successful!');
            } else {
                console.log('Invalid username or password');
                // Display an error message for invalid credentials
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during signin:', error);
        }
    },


    renderSignUpFailedScreen: async (message) => {
        // Load the sign up failed screen after failed signup
        const welcomeScreen = document.getElementById('SignUpFailedScreen');
        welcomeScreen.style.display = 'block';

        // Display the message on the welcome screen
        const welcomeMessage = document.getElementById('SignUpFailedMessage');
        welcomeMessage.innerText = message;

        // Add event listener for the logout button
        const logoutButton = document.getElementById('TryAgainButton');
        logoutButton.addEventListener('click', App.load_main_screen);

        // Hide the signup/login screen
        const authSection = document.getElementById('authSection');
        authSection.style.display = 'none';
    },

    renderWelcomeScreen: async (message, rideDetails) => {
        // Hide the signup/login screen
        let authSection = document.getElementById('authSection');
        authSection.style.display = 'none';

        // Load the welcome screen after successful signup
        const welcomeScreen = document.getElementById('welcomeScreen');
        welcomeScreen.style.display = 'block';
    
        // Display the message on the welcome screen
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.innerText = message;
    
        // Display the username on the welcome screen
        const welcomeUsername = document.getElementById('welcomeUsername');
        welcomeUsername.innerText = App.username;
    
        // Add event listener for the logout button
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', App.logout);
    
        App.showRideFields();

        // Display ride-related fields if available
        if (rideDetails) {
            const rideDetailsElement = document.getElementById('rideDetails');
            rideDetailsElement.style.display = 'block';  // Show the rideDetails div
            rideDetailsElement.innerHTML = `
                <p>Ride Details:</p>
                <p><strong>Car Registration:</strong> ${rideDetails.carRegistration}</p>
                <p><strong>Number of Seats:</strong> ${rideDetails.numberOfSeats}</p>
                <p><strong>Seat Price:</strong> ${rideDetails.seatPrice}</p>
                <div id="rideButtons">
                    <div id="bookRideForm">
                        <label for="username">Username:</label>
                        <input type="text" id="bookUsername" placeholder="Enter your username">
                        <br>
                        <label for="seatsRequired">Seats Required:</label>
                        <input type="number" id="seatsRequired" placeholder="Enter the number of seats required">
                        <br>
                        <button onclick="bookRide()">Book Ride</button>
                    </div>
                    <button onclick="cancelRide()">Cancel Ride</button>
                </div>
            `;

            // // Store the rideID in a data attribute of the rideDetailsElement
            // rideDetailsElement.dataset.rideId = rideID;
            rideID = rideID + 1;

        }

        // Hide the signup/login screen
        authSection = document.getElementById('authSection');
        authSection.style.display = 'none';
    },

    showRideFields: () => {
        // Display ride-related fields when the user is a driver
        const rideSection = document.getElementById('rideSection');
        rideSection.style.display = 'block';
    },

    startRide: async () => {
        try {
            // Assuming you have HTML elements for these inputs
            // let rideID = 1
            const carRegistration = document.getElementById('carRegistration').value;
            const numberOfSeats = parseInt(document.getElementById('numberOfSeats').value);
            const seatPrice = parseInt(document.getElementById('seatPrice').value);
    
            // Create rideDetails directly
            const rideDetails = {
                // rideID,
                carRegistration,
                numberOfSeats,
                seatPrice
            };
    
            // Use the ABI directly from the loaded contract
            const RideShareConnectContract = new web3.eth.Contract(App.contracts.RideShareConnect.abi, App.contracts.RideShareConnect.address);
            // rideID = rideID + 1;
            // Call the `startRide` method in the smart contract
            await RideShareConnectContract.methods.startRide(App.username, carRegistration, numberOfSeats, seatPrice).send({ from: App.account });
            
            console.log('Ride started successfully!');

            // Render the welcome screen with a success message and ride details
            await App.renderWelcomeScreen(`Ride started successfully!`, rideDetails);
        } catch (error) {
            console.error('Error during ride start:', error);
            // Render the welcome screen with an error message
            await App.renderWelcomeScreen('Failed to start the ride. Please try again.');
        }
    },

    bookRide: async () => {
        try {
            // Get the username and seatsRequired from the form
            const bookUsername = document.getElementById('bookUsername').value;
            const seatsRequired = parseInt(document.getElementById('seatsRequired').value);
    
            // // Get the rideID from the rideDetailsElement dataset
            // const rideDetailsElement = document.getElementById('rideDetails');
            // const rideID = rideDetailsElement.dataset.rideId;

            const rideid = rideID;
            console.log(bookUsername, seatsRequired, rideid);
    
            // Use the ABI directly from the loaded contract
            const RideShareConnectContract = new web3.eth.Contract(App.contracts.RideShareConnect.abi, App.contracts.RideShareConnect.address);
    
            // Call the `bookRide` method in the smart contract
            await RideShareConnectContract.methods.bookRide(bookUsername, seatsRequired, rideid).send({ from: App.account });
    
            console.log('Ride booked successfully!');
    
            // Render the welcome screen with a success message, you can customize this based on your needs
            await App.renderWelcomeScreen('Ride booked successfully!');

            
        } catch (error) {
            console.error('Error during ride booking:', error);
            // Render the welcome screen with an error message or take appropriate action
            await App.renderWelcomeScreen('Failed to book the ride. Please try again.');
        }
    },

    cancelRide: async () => {
        try {
            // Get the rideID from the rideDetailsElement dataset
            const rideDetailsElement = document.getElementById('rideDetails');
            const rideID = rideDetailsElement.dataset.rideId;
    
            // Use the ABI directly from the loaded contract
            const RideShareConnectContract = new web3.eth.Contract(App.contracts.RideShareConnect.abi, App.contracts.RideShareConnect.address);
    
            // Call the `cancelRide` method in the smart contract
            await RideShareConnectContract.methods.cancelRide().send({ from: App.account });
    
            console.log('Ride cancelled successfully!');
    
            // Render the welcome screen with a success message, you can customize this based on your needs
            await App.renderWelcomeScreen('Ride cancelled successfully!');
        } catch (error) {
            console.error('Error during ride cancellation:', error);
            // Render the welcome screen with an error message or take appropriate action
            await App.renderWelcomeScreen('Failed to cancel the ride. Please try again.');
        }
    },
    
    // Modify the logout function to call the resetUI function
    logout: async () => {
        // Log out the user and reset the UI to the default state
        App.username = null;
        App.account = null;
        resetUI();

        // Update MetaMask status
        App.updateMetaMaskStatus();
    },

    load_main_screen: async () => {
        // Log out the user and navigate back to the signup/login screen
        const welcomeScreen = document.getElementById('SignUpFailedScreen');
        welcomeScreen.style.display = 'none';

        // Reset username and account
        App.username = null;
        App.account = null;

        // Show signup/login screen
        const authSection = document.getElementById('authSection');
        authSection.style.display = 'block';

        // Update MetaMask status
        App.updateMetaMaskStatus();
    },

    updateMetaMaskStatus: () => {
        // Check if MetaMask is installed and connected
        if (window.ethereum && window.ethereum.isMetaMask) {
            document.getElementById('metamaskStatus').innerText = 'MetaMask is installed and connected!';
        } else {
            document.getElementById('metamaskStatus').innerText = 'MetaMask is not installed or not connected.';
        }
    },
};

    // Add a function to reset the UI to the default state
    const resetUI = () => {
        // Reset the welcome screen
        const welcomeScreen = document.getElementById('welcomeScreen');
        welcomeScreen.style.display = 'none';

        // Show the signup/login screen
        const authSection = document.getElementById('authSection');
        authSection.style.display = 'block';

        // Hide ride-related fields
        const rideSection = document.getElementById('rideSection');
        rideSection.style.display = 'none';

        // Clear input fields
        document.getElementById('carRegistration').value = '';
        document.getElementById('numberOfSeats').value = '';
        document.getElementById('seatPrice').value = '';
    };

document.addEventListener('DOMContentLoaded', () => {
    App.load();
    console.log("RUNNING ALL")
});