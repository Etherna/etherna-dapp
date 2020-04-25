// Inject the latest version of
// the web3 package
const Web3 = require("web3")
window.web3 = new Web3(window.web3 && window.web3.currentProvider)

var NOTICE = 'No need to inject web 3 --> use web3 instance in redux store'

// Override hashMessage with custom implementation.
// This is because to update a swarm feed it cannot
// have the default prefix “\x19Ethereum Signed Message”

// window.web3.eth.personal.hashMessage = function hashMessage(data) {
//     console.log('personal in');

//     if (window.web3.eth.disableSignPrefix === true) {
//         return data
//     }
//     var message = window.web3.utils.isHexStrict(data) ? window.web3.utils.hexToBytes(data) : data
//     var messageBuffer = Buffer.from(message)
//     var preamble = '\x19Ethereum Signed Message:\n' + message.length
//     var preambleBuffer = Buffer.from(preamble)
//     var ethMessage = Buffer.concat([preambleBuffer, messageBuffer])
//     return window.web3.utils.sha3._Hash.keccak256s(ethMessage)
// }
// window.web3.eth.accounts.hashMessage = function hashMessage(data) {
//     console.log('accounts in');

//     if (window.web3.eth.disableSignPrefix === true) {
//         return data
//     }
//     var message = window.web3.utils.isHexStrict(data) ? window.web3.utils.hexToBytes(data) : data
//     var messageBuffer = Buffer.from(message)
//     var preamble = '\x19Ethereum Signed Message:\n' + message.length
//     var preambleBuffer = Buffer.from(preamble)
//     var ethMessage = Buffer.concat([preambleBuffer, messageBuffer])
//     return window.web3.utils.sha3._Hash.keccak256s(ethMessage)
// }