App = {
    loading: false,
    contracts: {},
    account: null,

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
        // Implement your UI rendering logic here
        // You can use App.account and App.contracts.RideShareConnect to interact with the smart contract
    },

    signupCustomer: async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        await App.contracts.RideShareConnect.deployed().then(async (instance) => {
            await instance.signupCustomer(username, password, { from: App.account });
            console.log('User signed up as customer:', username);
        });

        await App.render();
    },

    signupDriver: async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const carRegistration = document.getElementById('carRegistration').value;
        const numberOfSeats = document.getElementById('numberOfSeats').value;
        const seatPrice = document.getElementById('seatPrice').value;

        await App.contracts.RideShareConnect.deployed().then(async (instance) => {
            await instance.signupDriver(username, password, carRegistration, numberOfSeats, seatPrice, { from: App.account });
            console.log('User signed up as driver:', username);
        });

        await App.render();
    },

    signin: async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        await App.contracts.RideShareConnect.deployed().then(async (instance) => {
            const isSignedIn = await instance.signin(username, password, { from: App.account });
            if (isSignedIn) {
                console.log('User signed in:', username);
            } else {
                console.log('Invalid username or password');
            }
        });

        await App.render();
    },
};

document.addEventListener('DOMContentLoaded', () => {
    App.load();
});
