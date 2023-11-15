const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
const signer = Keypair.fromSecretKey(bs58.decode(""));

console.log(signer);
