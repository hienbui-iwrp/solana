import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { Solana } from "../target/types/solana";
import {
  ACCOUNT_SIZE,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  approve,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createInitializeMintInstruction,
  createMint,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  Account,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";

describe("solana", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  // const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //   "HAHr5pggn8qorwG8TiXW6qfGmMTA2og6q4wtHBXQBKtF"
  // );
  // Generate a random keypair that will represent our token

  // const mintKeypair: anchor.web3.Keypair = Keypair.generate();
  // const mintKey: anchor.web3.PublicKey = mintKeypair.publicKey;

  // AssociatedTokenAccount for anchor's workspace wallet
  const program = anchor.workspace.Solana as Program<Solana>;

  // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
    "9qgk7Mx2ydPZiTfhrKyy7py8x7k6cd9WMycV1oSnA6s2"
  );
  console.log("mintKey: ", mintKey);

  // it("transfer token", async () => {
  //   const signer = Keypair.fromSecretKey(
  //     bs58.decode(
  //       "2jRmRZjxVNcmu4Tkgc322VrMxE1C2VRbkDpGvbmsR2zGFTaSTmyprcpAFLwaG8tN9Dru3eLNyoXdJcCXUVUrrm7T"
  //     )
  //   );
  //   // Generate keypairs for the new accounts
  //   // const toKp = new web3.Keypair();
  //   const toWallet: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //     "AnVaDqMUTP4xfCj1cq2yKHxt3KRxfZFWEtci5atDwioQ"
  //   );

  //   // Create a new mint and initialize it
  //   // const mint = await createMint(
  //   //   connection,
  //   //   signer,
  //   //   signer.publicKey,
  //   //   null,
  //   //   0
  //   // );
  //   // const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //   //   "5aHDQtsDbE8d33VrJ7wWwJATjx6RwZwnekTZy1auyeV3"
  //   // );
  //   const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //     "4B7ushztcK4NAWdLyFoP5dxWKdHs9E3PCsjhQvz37XPv"
  //   );

  //   console.log("mint: ", mintKey);

  //   // Create associated token accounts for the new accounts
  //   const fromAta = (
  //     await getOrCreateAssociatedTokenAccount(
  //       connection,
  //       signer,
  //       mintKey,
  //       signer.publicKey
  //     )
  //   ).address;
  //   console.log("fromAta: ", fromAta);

  //   const toAta = (
  //     await getOrCreateAssociatedTokenAccount(
  //       connection,
  //       signer,
  //       mintKey,
  //       toWallet
  //     )
  //   ).address;
  //   console.log("toAta: ", toAta);

  //   // Send transaction
  //   const transferAmount = new anchor.BN(10);
  //   const txHash = await program.methods
  //     .transferToken(transferAmount)
  //     .accounts({
  //       authority: signer.publicKey,
  //       from: fromAta,
  //       to: toAta,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .signers([signer])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  //   console.log(await connection.confirmTransaction(txHash, "finalized"));
  // });

  // it("token account", async () => {
  //   const signer = Keypair.fromSecretKey(
  //     bs58.decode(
  //       "2jRmRZjxVNcmu4Tkgc322VrMxE1C2VRbkDpGvbmsR2zGFTaSTmyprcpAFLwaG8tN9Dru3eLNyoXdJcCXUVUrrm7T"
  //     )
  //   );
  //   // Generate keypairs for the new accounts
  //   // const toKp = new web3.Keypair();
  //   const toWallet: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //     "AnVaDqMUTP4xfCj1cq2yKHxt3KRxfZFWEtci5atDwioQ"
  //   );
  //   // Create a new mint and initialize it
  //   // const mint = await createMint(
  //   //   connection,
  //   //   signer,
  //   //   signer.publicKey,
  //   //   null,
  //   //   0
  //   // );
  //   const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //     "3TrPDVHBjcngbvytfBRxYsGU5RAdVJwaovoxKq9qi2JY"
  //   );

  //   console.log("mint: ", mintKey);

  //   // Create associated token accounts for the new accounts

  //   // Send transaction
  //   const txHash = await program.methods
  //     .getTokenAccount()
  //     .accounts({
  //       mint: mintKey,
  //       owner: signer.publicKey,
  //     })
  //     .signers([signer])
  //     .rpc();
  //   console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  //   const getReturnLog = (confirmedTransaction: any) => {
  //     const prefix = "Program return: ";
  //     let log = confirmedTransaction.meta.logMessages.find((log) =>
  //       log.startsWith(prefix)
  //     );
  //     log = log.slice(prefix.length);
  //     const [key, data] = log.split(" ", 2);
  //     const buffer = Buffer.from(data, "base64");
  //     return [key, data, buffer];
  //   };
  //   const returnValue = await connection.confirmTransaction(
  //     txHash,
  //     "finalized"
  //   );
  //   console.log("returnValue: ", returnValue);
  // });

  it("exchange", async () => {
    // master
    const buyer = Keypair.fromSecretKey(
      bs58.decode(
        "2jRmRZjxVNcmu4Tkgc322VrMxE1C2VRbkDpGvbmsR2zGFTaSTmyprcpAFLwaG8tN9Dru3eLNyoXdJcCXUVUrrm7T"
      )
    );

    // slave
    const seller = Keypair.fromSecretKey(
      bs58.decode(
        "53TekE7TmKdBMMN226DCJy4GmxbQa6M5oLwPXaPoL4shq82D15CcHaJbSQ2Jte7rzzY7e27TMo4Thc3vLZN1BAAS"
      )
    );

    // Create a new mint and initialize it
    // const mint = await createMint(
    //   connection,
    //   signer,
    //   signer.publicKey,
    //   null,
    //   0
    // );
    // const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
    //   "5aHDQtsDbE8d33VrJ7wWwJATjx6RwZwnekTZy1auyeV3"
    // );
    // const mintKey = await createMint(
    //   program.provider.connection,
    //   signer,
    //   signer.publicKey,
    //   null,
    //   0
    // );
    const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
      "BxnbREJ2UEyDb8jJ125YAUvkyHpeGm3czjjraA8rwSAJ"
    );

    console.log("mint: ", mintKey);

    // Create associated token accounts for the new accounts
    const fromAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        buyer,
        mintKey,
        seller.publicKey
      )
    ).address;
    console.log("fromAta: ", fromAta);

    const toAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        buyer,
        mintKey,
        buyer.publicKey
      )
    ).address;
    console.log("toAta: ", toAta);

    // approve
    const approveLog = await approve(
      connection,
      seller,
      fromAta,
      buyer.publicKey,
      seller.publicKey,
      1
    );

    console.log("approveLog: ", approveLog);

    // Send transaction
    const transferAmount = new anchor.BN(10 ** 8);
    const txHash = await program.methods
      .exchange(transferAmount)
      .accounts({
        authority: buyer.publicKey,
        fromAta: fromAta,
        seller: seller.publicKey,
        buyer: buyer.publicKey,
        toAta: toAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    console.log(await connection.confirmTransaction(txHash, "finalized"));
  });
});
