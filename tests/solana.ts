import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { Solana } from "../target/types/solana";
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
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";

describe("solana", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const master = Keypair.fromSecretKey(
    bs58.decode(
      "2jRmRZjxVNcmu4Tkgc322VrMxE1C2VRbkDpGvbmsR2zGFTaSTmyprcpAFLwaG8tN9Dru3eLNyoXdJcCXUVUrrm7T"
    )
  );
  // slave
  const slave = Keypair.fromSecretKey(
    bs58.decode(
      "53TekE7TmKdBMMN226DCJy4GmxbQa6M5oLwPXaPoL4shq82D15CcHaJbSQ2Jte7rzzY7e27TMo4Thc3vLZN1BAAS"
    )
  );

  // slave2
  const slave2 = Keypair.fromSecretKey(
    bs58.decode(
      "5LSYGKciCViPcWvyDN8WQoYGLzWae2ahSiaVRJgx48gUWXfBefFvsj4Yvqb4UWabBdcMpajtKRSz9AK6F9sNXawo"
    )
  );
  // AssociatedTokenAccount for anchor's workspace wallet
  const program = anchor.workspace.Solana as Program<Solana>;

  it("Exchange", async () => {
    // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // master
    const buyer = master;
    // slave
    const seller = slave;
    const authority = slave2;

    const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
      "2zFJceHaC8SQonMLsMHia2s82w9VA2GNmEbYDkkxgNVH"
    );
    console.log("mintKey: ", mintKey);

    // Create associated token accounts for the new accounts
    const fromAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        seller,
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
      authority.publicKey,
      seller.publicKey,
      1
    );
    console.log("approve log: ", approveLog);

    const txHash = await program.methods
      .exchange(new anchor.BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        mint: mintKey,
        fromAta: fromAta,
        seller: seller.publicKey,
        toAta: toAta,
        buyer: buyer.publicKey,
        authority: authority.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([authority])
      .rpc();

    console.log(txHash);
  });

  // it("exchange renec", async () => {
  //   const connection = new Connection(
  //     "https://api-testnet.renec.foundation:8899",
  //     "confirmed"
  //   );

  //   // master
  //   const buyer = Keypair.fromSecretKey(
  //     bs58.decode(
  //       "2jRmRZjxVNcmu4Tkgc322VrMxE1C2VRbkDpGvbmsR2zGFTaSTmyprcpAFLwaG8tN9Dru3eLNyoXdJcCXUVUrrm7T"
  //     )
  //   );

  //   // slave
  //   const seller = Keypair.fromSecretKey(
  //     bs58.decode(
  //       "53TekE7TmKdBMMN226DCJy4GmxbQa6M5oLwPXaPoL4shq82D15CcHaJbSQ2Jte7rzzY7e27TMo4Thc3vLZN1BAAS"
  //     )
  //   );

  //   const mintKey: anchor.web3.PublicKey = new anchor.web3.PublicKey(
  //     "AK8tw64fY7bJR56WzhD5YcyabTfgwBcS1XRvmjfdZ13q"
  //   );

  //   console.log("mint: ", mintKey);

  //   const fromATA = await findAssociatedTokenAddress(seller.publicKey, mintKey);
  //   console.log("fromATA: ", fromATA);

  //   // Create associated token accounts for the new accounts
  //   // const fromAta = (
  //   //   await getOrCreateAssociatedTokenAccount(
  //   //     connection,
  //   //     buyer,
  //   //     mintKey,
  //   //     seller.publicKey
  //   //   )
  //   // ).address;
  //   // console.log("fromAta: ", fromAta);

  //   // const toAta = (
  //   //   await getOrCreateAssociatedTokenAccount(
  //   //     connection,
  //   //     buyer,
  //   //     mintKey,
  //   //     buyer.publicKey
  //   //   )
  //   // ).address;
  //   // console.log("toAta: ", toAta);

  //   // // approve
  //   // const approveLog = await approve(
  //   //   connection,
  //   //   seller,
  //   //   fromAta,
  //   //   buyer.publicKey,
  //   //   seller.publicKey,
  //   //   1
  //   // );

  //   // console.log("approveLog: ", approveLog);

  //   // // Send transaction
  //   // const transferAmount = new anchor.BN(10 ** 8);
  //   // const txHash = await program.methods
  //   //   .exchange(transferAmount)
  //   //   .accounts({
  //   //     authority: buyer.publicKey,
  //   //     fromAta: fromAta,
  //   //     seller: seller.publicKey,
  //   //     buyer: buyer.publicKey,
  //   //     toAta: toAta,
  //   //     tokenProgram: TOKEN_PROGRAM_ID,
  //   //   })
  //   //   .signers([buyer])
  //   //   .rpc();
  //   // console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
  //   // console.log(await connection.confirmTransaction(txHash, "finalized"));
  // });
});

const RPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      RPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0];
}
