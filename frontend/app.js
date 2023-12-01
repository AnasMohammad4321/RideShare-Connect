App = {
    loading: false,
    contracts: {},
  
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
        } catch (error) {
          console.error("User denied account access.");
        }
      } else if (window.web3) {
        App.web3Provider = web3.currentProvider;
        window.web3 = new Web3(web3.currentProvider);
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    },
  
    loadAccount: async () => {
      App.account = web3.eth.accounts[0];
    },
  
    loadContract: async () => {
      // Replace 'RideShare.json' with the actual compiled JSON file for your RideShare contract
      const rideShareContract = await $.getJSON('build/contracts/RideShare.json');
      App.contracts.RideShare = TruffleContract(rideShareContract);
      App.contracts.RideShare.setProvider(App.web3Provider);
  
      App.rideShareInstance = await App.contracts.RideShare.deployed();
    },
  
    render: async () => {
      if (App.loading) {
        return;
      }
  
      App.setLoading(true);
  
      $('#account').html(App.account);
  
      // Additional rendering logic can be added here based on your project requirements
  
      App.setLoading(false);
    },
  
    // Add more functions as needed based on your project requirements
    // For example: createRide, joinRide, etc.
  
    setLoading: (boolean) => {
      App.loading = boolean;
      const loader = $('#loader');
      const content = $('#content');
      if (boolean) {
        loader.show();
        content.hide();
      } else {
        loader.hide();
        content.show();
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load();
    });
  });
  