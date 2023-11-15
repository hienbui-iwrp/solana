import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { Marketplace } from "../target/types/marketplace";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  approve,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import bs58 from "bs58";
import idl from "../target/idl/marketplace.json";
import config from "./config.json";
require("dotenv").config();

const programID = new PublicKey(config.programId);

describe("Solana", async () => {
  // LIST KEYPAIR
  const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

  //   SET PROGRAM
  const connection = new Connection(
    "https://api-testnet.renec.foundation:8899",
    "confirmed"
  );
  const wallet = new NodeWallet(
    Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_DEPLOYER))
  );
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "processed",
  });
  const program = new anchor.Program(idl as Marketplace, programID, provider);
  let mintKey = null;

  // select role
  const minter = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_RENEC_1)
  );
  const buyer = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_RENEC_2)
  );
  const authority = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_RENEC_3)
  );

  it("Mint NFT", async () => {
    const newMint = Keypair.generate();
    mintKey = newMint.publicKey;
    console.log("newMint: ", newMint.publicKey.toString());
    const tokenAccount = await getAssociatedTokenAddress(
      newMint.publicKey,
      minter.publicKey
    );
    console.log("tokenAccount: ", tokenAccount.toString());
    const tx = await program.methods
      .mintNft()
      .accounts({
        mint: newMint.publicKey,
        tokenAccount: tokenAccount,
        authority: minter.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([newMint, minter])
      .rpc();
    console.log(
      `https://explorer.renec.foundation/transaction/${tx}?cluster=testnet`
    );
  });
  it("Exchange", async () => {
    console.log("mintKey: ", mintKey);
    // Create associated token accounts for the new accounts
    const fromAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        minter,
        mintKey,
        minter.publicKey
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
      minter,
      fromAta,
      authority.publicKey,
      minter.publicKey,
      1
    );
    console.log("approve log: ", approveLog);
    const txHash = await program.methods
      .exchange(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        mint: mintKey,
        fromAta: fromAta,
        seller: minter.publicKey,
        toAta: toAta,
        buyer: buyer.publicKey,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([authority, buyer])
      .rpc();
    console.log(txHash);
  });
});
