const {
  Account,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} = require("@solana/web3.js");
const bs58 = require("bs58");
const signer = Keypair.fromSecretKey(
  bs58.decode(
    "53TekE7TmKdBMMN226DCJy4GmxbQa6M5oLwPXaPoL4shq82D15CcHaJbSQ2Jte7rzzY7e27TMo4Thc3vLZN1BAAS"
  )
);

console.log(signer);
