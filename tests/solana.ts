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
  const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
    "Cq8hxPZGiHNzsPG86jbL6JyC6mAm5ETHp7pLh8My7a9Y"
  );

  // const mintKeypair: anchor.web3.Keypair = Keypair.generate();
  // const mintKey: anchor.web3.PublicKey = mintKeypair.publicKey;
  console.log("mintKey: ", mintKey);

  // AssociatedTokenAccount for anchor's workspace wallet
  const program = anchor.workspace.Solana as Program<Solana>;

  // const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  it("test", async () => {
    const fromWallet: anchor.web3.PublicKey = new anchor.web3.PublicKey(
      "2LvdTByDDo4t2gv43PauUWZwMSUGYvPtLFPtpSeGDepu"
    );
    const toWallet: anchor.web3.PublicKey = new anchor.web3.PublicKey(
      "AnVaDqMUTP4xfCj1cq2yKHxt3KRxfZFWEtci5atDwioQ"
    );
    const signer = Keypair.fromSecretKey(
      bs58.decode(
        "2jRmRZjxVNcmu4Tkgc322VrMxE1C2VRbkDpGvbmsR2zGFTaSTmyprcpAFLwaG8tN9Dru3eLNyoXdJcCXUVUrrm7T"
      )
    );

    const fromAta = await getAssociatedTokenAddress(mintKey, fromWallet);
    console.log("fromAta: ", fromAta);
    const toAta = await getAssociatedTokenAddress(mintKey, toWallet);
    const localWallet = anchor.AnchorProvider.env().wallet.publicKey;
    console.log("toAta: ", toAta);

    const tx = new Transaction();
    tx.add(
      createAssociatedTokenAccountInstruction(
        signer.publicKey, // payer
        toAta, // ata
        toWallet, // owner
        mintKey // mint
      )
    );
    const instructions = [
      createAssociatedTokenAccountInstruction(
        signer.publicKey, // payer
        fromAta, // ata
        fromWallet, // owner
        mintKey // mint
      ),
    ];
    let blockhash = await connection
      .getLatestBlockhash()
      .then((res) => res.blockhash);
    const messageV0 = new web3.TransactionMessage({
      payerKey: signer.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // const transaction = new web3.VersionedTransaction(messageV0);
    // transaction.sign([signer]);
    // console.log(
    //   `create ata txhash: ${await connection.sendTransaction(transaction)}`
    // );

    let approveLog = await approve(
      connection,
      signer,
      fromAta,
      program.programId,
      signer,
      1,
      []
    );
    console.log("approveLog: ", approveLog);
    let log = await program.methods
      .transferToken(new anchor.BN(1))
      .accounts({
        from: fromAta,
        to: toAta,
        authority: signer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([signer])
      .rpc();
    console.log("-----", log);
    // const log = await anchor.web3.sendAndConfirmTransaction(
    //   connection,
    //   transaction,
    //   [signer]
    // );
    // console.log("log: ", log);
  });
});
