// Inject the latest version of
// the web3 package
const Web3 = require("web3")
window.web3 = new Web3(window.web3 && window.web3.currentProvider)