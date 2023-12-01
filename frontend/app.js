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
            web3 = new Web3(web3.currentProvider);
        } else {
            window.alert("Please connect to Metamask.");
        }

        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                await ethereum.enable();
                web3.eth.sendTransaction({/* ... */});
            } catch (error) {
                console.error('User denied account access:', error);
            }
        } else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);
            web3.eth.sendTransaction({/* ... */});
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
        // Load your smart contract here using its ABI and address
        const RideShareConnectContract = await $.getJSON('RideShareConnect.json');
        App.contracts.RideShareConnect = TruffleContract(RideShareConnectContract);
        App.contracts.RideShareConnect.setProvider(App.web3Provider);

        // Example: call smart contract functions after loading
        // await App.contracts.RideShareConnect.deployed().then(async (instance) => {
        //     await instance.signupCustomer("customerUsername", "customerPassword");
        // });
    },

    render: async () => {
        // Display the current account
        document.getElementById('account').innerText = App.account;
    
        // Check if the user is signed in
        const isSignedIn = await App.contracts.RideShareConnect.deployed().then(instance =>
            instance.isSignedIn({ from: App.account })
        );
    
        if (isSignedIn) {
            // Display user-specific content for a signed-in user
            document.getElementById('userStatus').innerText = 'Signed In';
        } else {
            // Display user-specific content for a user who is not signed in
            document.getElementById('userStatus').innerText = 'Not Signed In';
        }
    
        // Example: Display the available seats in the carpool
        const availableSeats = await App.contracts.RideShareConnect.deployed().then(instance =>
            instance.getAvailableSeats({ from: App.account })
        );
    
        document.getElementById('availableSeats').innerText = availableSeats.toString();
    
        // You can add more rendering logic based on your UI requirements
    
        // Example: Display a button to sign up as a customer if the user is not signed in
        if (!isSignedIn) {
            document.getElementById('signupCustomerButton').style.display = 'block';
        } else {
            document.getElementById('signupCustomerButton').style.display = 'none';
        }
    
        // Example: Display a button to sign up as a driver if the user is not signed in
        if (!isSignedIn) {
            document.getElementById('signupDriverButton').style.display = 'block';
        } else {
            document.getElementById('signupDriverButton').style.display = 'none';
        }
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

            await App.contracts.RideShareConnect.deployed().then(async (instance) => {
                await instance.signupCustomer(username, password, { from: selectedAccount });
                console.log('User signed up as customer:', username);

                // Update account and username
                App.account = selectedAccount;
                App.username = username;

                // Render the welcome screen with a success message
                await App.renderWelcomeScreen('Signup successful!');
            });
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

            const instance = await App.contracts.RideShareConnect.deployed();
            const isSignedIn = await instance.signin(username, password, { from: App.account });

            if (isSignedIn) {
                console.log('User signed in:', username);
                // Call renderWelcomeScreen or any other logic
                await App.renderWelcomeScreen('Login successful!');
            } else {
                console.log('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during signin:', error);
        }

        // Call App.render() or any other necessary functions after signin
        await App.render();
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

    renderWelcomeScreen: async (message) => {
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

        // Hide the signup/login screen
        const authSection = document.getElementById('authSection');
        authSection.style.display = 'none';
    },
    

    logout: async () => {
        // Log out the user and navigate back to the signup/login screen
        const welcomeScreen = document.getElementById('welcomeScreen');
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

document.addEventListener('DOMContentLoaded', () => {
    App.load();
});