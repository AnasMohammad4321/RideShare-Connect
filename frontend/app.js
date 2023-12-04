App = {
    loading: false,
    contracts: {},
    account: null,
    contractInstance: null,

    load: async () => {
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            window.alert("Please connect to MetaMask.");
        }

        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                await ethereum.request({ method: 'eth_requestAccounts' });
                // web3.eth.sendTransaction({/* ... */}); // Note: Not sure why you need this line
            } catch (error) {
                console.error('User denied account access:', error);
            }
        } else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);
            // web3.eth.sendTransaction({/* ... */}); // Note: Not sure why you need this line
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    },

    loadAccount: async () => {
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0];
    },

    loadContract: async () => {
        try {
            // Use a relative path assuming the contract JSON is in the same directory as your HTML file
            const response = await fetch('./build/contracts/RideShareConnect.json');
    
            if (!response.ok) {
                throw new Error(`Failed to fetch contract JSON: ${response.status} ${response.statusText}`);
            }
    
            const RideShareConnectContract = await response.json();
    
            if (!RideShareConnectContract || Object.keys(RideShareConnectContract).length === 0) {
                throw new Error('Invalid or empty contract JSON');
            }
    
            App.contracts.RideShareConnect = TruffleContract(RideShareConnectContract);
            App.contracts.RideShareConnect.setProvider(App.web3Provider);
    
            // Deploy the contract and set the instance
            App.contractInstance = await App.contracts.RideShareConnect.deployed();
        } catch (error) {
            console.error('Error deploying the contract:', error);
        }
    },
    
    
    

    render: async () => {
        // Implement your UI rendering logic here
        // You can use App.account and App.contractInstance to interact with the smart contract
    },

    signupCustomer: async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Use the stored contract instance
            await App.contractInstance.signupCustomer(username, password, { from: App.account });
            console.log('User signed up as customer:', username);
        } catch (error) {
            console.error('Error signing up as customer:', error);
        }

        await App.render();
    },

    signupDriver: async () => {
        // Similar modifications as in signupCustomer function
        // ...
    },

    signin: async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const isSignedIn = await App.contractInstance.signin(username, password, { from: App.account });
            if (isSignedIn) {
                console.log('User signed in:', username);
            } else {
                console.log('Invalid username or password');
            }
        } catch (error) {
            console.error('Error signing in:', error);
        }

        await App.render();
    },
};

document.addEventListener('DOMContentLoaded', async () => {
    await App.load();
});
