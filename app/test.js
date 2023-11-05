const { Keypair } = require("@solana/web3.js");

let bs58 = require("bs58");
const bs = bs58.decode(
  "5LSYGKciCViPcWvyDN8WQoYGLzWae2ahSiaVRJgx48gUWXfBefFvsj4Yvqb4UWabBdcMpajtKRSz9AK6F9sNXawo"
);

const wallet = Keypair.fromSecretKey(bs);
console.log(wallet);
