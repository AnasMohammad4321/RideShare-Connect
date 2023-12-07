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

    renderWelcomeScreen: async (message) => {
        // Hide the signup/login screen
        const authSection = document.getElementById('authSection');
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
    console.log("RUNNING ALL")
});