import Web3 from "web3"

export type WindowWeb3 = Window & {
  web3?: Web3
  ethereum?: object
}
