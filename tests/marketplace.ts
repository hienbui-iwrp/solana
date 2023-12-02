import * as anchor from "@project-serum/anchor";
import { Program, web3 } from "@project-serum/anchor";
import { SolanaNft } from "../target/types/solana_nft";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import bs58 from "bs58";
import idl from "../target/idl/solana_nft.json";
import config from "./config.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
require("dotenv").config();

const programID = new PublicKey(config.programId);

describe("Solana", async () => {
  // LIST KEYPAIR
  const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
  const RENEC_METADATA_PROGRAM_ID = new PublicKey(
    "metaXfaoQatFJP9xiuYRsKkHYgS5NqqcfxFbLGS5LdN"
  );

  //   SET PROGRAM
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  // const connection = new Connection(
  //   "https://api-testnet.renec.foundation:8899",
  //   "confirmed"
  // );
  const deployer = new NodeWallet(
    Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY_DEPLOYER))
  );
  const provider = new anchor.AnchorProvider(connection, deployer, {
    preflightCommitment: "recent",
    commitment: "processed",
  });
  const program = new anchor.Program(idl as SolanaNft, programID, provider);
  let mintKey = null;

  // select role
  const minter = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_SOLANA_1)
  );

  const receiver = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_SOLANA_2)
  );

  const other = Keypair.fromSecretKey(
    bs58.decode(process.env.PRIVATE_KEY_SOLANA_3)
  );
  // const umi = createUmi("https://api-testnet.renec.foundation:8899")
  //   .use(walletAdapterIdentity(provider.wallet))
  //   .use(mplTokenMetadata());
  // const umi = createUmi(clusterApiUrl("devnet"))
  //   .use(walletAdapterIdentity(provider.wallet))
  //   .use(mplTokenMetadata());

  it("Mint NFT", async () => {
    const newMint = Keypair.generate();
    mintKey = newMint.publicKey;
    console.log("newMint: ", newMint.publicKey.toString());
    const tokenAccount = await getAssociatedTokenAddress(
      newMint.publicKey,
      minter.publicKey
    );
    console.log("tokenAccount: ", tokenAccount.toString());
    const name = "Some NFT";
    const symbol = "SOME";
    const uri =
      "https://bafkreicctlwmsohditft23zxofu43ssjuxoztrlava3t6dedi7f2i6p22i.ipfs.nftstorage.link/";
    // const uri = "";
    // derive the metadata account
    const [metadataPDA, metadataBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
        newMint.publicKey.toBuffer(),
      ],
      new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
    );
    console.log("metadataPDA: ", metadataPDA, metadataBump);
    const [metadataPDA2, metadataBump2] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        new PublicKey(RENEC_METADATA_PROGRAM_ID).toBuffer(),
        newMint.publicKey.toBuffer(),
      ],
      new PublicKey(RENEC_METADATA_PROGRAM_ID)
    );
    // let metadataAccount = findMetadataPda(umi, {
    //   mint: publicKey(newMint.publicKey),
    // })[0];

    console.log("metadataPDA2: ", metadataPDA2, metadataBump2);
    // //derive the master edition pda
    // let masterEditionAccount = findMasterEditionPda(umi, {
    //   mint: publicKey(newMint.publicKey),
    // })[0];
    // console.log("masterEditionAccount: ", masterEditionAccount);
    const param = {
      name: "Some NFT123",
      symbol: "SOME",
      uri: "https://bafkreicctlwmsohditft23zxofu43ssjuxoztrlava3t6dedi7f2i6p22i.ipfs.nftstorage.link/",
      decimals: 0,
      bump: metadataBump,
    };
    const tx = await program.methods
      .initNft(param)
      .accounts({
        signer: minter.publicKey,
        mint: newMint.publicKey,
        associatedTokenAccount: tokenAccount,
        metadataAccount: metadataPDA,
        // masterEditionAccount: masterEditionAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
        // tokenMetadataProgram: RENEC_METADATA_PROGRAM_ID,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        other: other.publicKey,
      })
      .signers([newMint, minter])
      .rpc();
    console.log(`https://explorer.solana.com/transaction/${tx}?cluster=devnet`);
    // const m = await getMetadataAccount(newMint.publicKey.toString());
    // console.log("metadata acc: ", m);
    // // get the account info for that account
    // const accInfo = await connection.getAccountInfo(new PublicKey(m));
    // console.log("accInfo: ", accInfo);
    // // finally, decode metadata
    // console.log("decode: ", decodeMetadata(accInfo!.data));
  });
});

import { BinaryReader, BinaryWriter, deserializeUnchecked } from "borsh";
import base58 from "bs58";

export const METADATA_PROGRAM_ID =
  "metaXfaoQatFJP9xiuYRsKkHYgS5NqqcfxFbLGS5LdN" as StringPublicKey;
export const METADATA_PREFIX = "metadata";

const PubKeysInternedMap = new Map<string, PublicKey>();

// Borsh extension for pubkey stuff
(BinaryReader.prototype as any).readPubkey = function () {
  const reader = this as unknown as BinaryReader;
  const array = reader.readFixedArray(32);
  return new PublicKey(array);
};

(BinaryWriter.prototype as any).writePubkey = function (value: PublicKey) {
  const writer = this as unknown as BinaryWriter;
  writer.writeFixedArray(value.toBuffer());
};

(BinaryReader.prototype as any).readPubkeyAsString = function () {
  const reader = this as unknown as BinaryReader;
  const array = reader.readFixedArray(32);
  return base58.encode(array) as StringPublicKey;
};

(BinaryWriter.prototype as any).writePubkeyAsString = function (
  value: StringPublicKey
) {
  const writer = this as unknown as BinaryWriter;
  writer.writeFixedArray(base58.decode(value));
};

const toPublicKey = (key: string | PublicKey) => {
  if (typeof key !== "string") {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

const findProgramAddress = async (
  seeds: (Buffer | Uint8Array)[],
  programId: PublicKey
) => {
  const key =
    "pda-" +
    seeds.reduce((agg, item) => agg + item.toString("hex"), "") +
    programId.toString();

  const result = await PublicKey.findProgramAddress(seeds, programId);

  return [result[0].toBase58(), result[1]] as [string, number];
};

export type StringPublicKey = string;

export enum MetadataKey {
  Uninitialized = 0,
  MetadataV1 = 4,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
  EditionMarker = 7,
}

class Creator {
  address: StringPublicKey;
  verified: boolean;
  share: number;

  constructor(args: {
    address: StringPublicKey;
    verified: boolean;
    share: number;
  }) {
    this.address = args.address;
    this.verified = args.verified;
    this.share = args.share;
  }
}

class Data {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Creator[] | null;
  constructor(args: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: Creator[] | null;
  }) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.uri = args.uri;
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
    this.creators = args.creators;
  }
}

class Metadata {
  key: MetadataKey;
  updateAuthority: StringPublicKey;
  mint: StringPublicKey;
  data: Data;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;

  // set lazy
  masterEdition?: StringPublicKey;
  edition?: StringPublicKey;

  constructor(args: {
    updateAuthority: StringPublicKey;
    mint: StringPublicKey;
    data: Data;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number | null;
  }) {
    this.key = MetadataKey.MetadataV1;
    this.updateAuthority = args.updateAuthority;
    this.mint = args.mint;
    this.data = args.data;
    this.primarySaleHappened = args.primarySaleHappened;
    this.isMutable = args.isMutable;
    this.editionNonce = args.editionNonce;
  }
}

const METADATA_SCHEMA = new Map<any, any>([
  [
    Data,
    {
      kind: "struct",
      fields: [
        ["name", "string"],
        ["symbol", "string"],
        ["uri", "string"],
        ["sellerFeeBasisPoints", "u16"],
        ["creators", { kind: "option", type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: "struct",
      fields: [
        ["address", "pubkeyAsString"],
        ["verified", "u8"],
        ["share", "u8"],
      ],
    },
  ],
  [
    Metadata,
    {
      kind: "struct",
      fields: [
        ["key", "u8"],
        ["updateAuthority", "pubkeyAsString"],
        ["mint", "pubkeyAsString"],
        ["data", Data],
        ["primarySaleHappened", "u8"], // bool
        ["isMutable", "u8"], // bool
      ],
    },
  ],
]);

export async function getMetadataAccount(
  tokenMint: StringPublicKey
): Promise<StringPublicKey> {
  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(METADATA_PROGRAM_ID).toBuffer(),
        toPublicKey(tokenMint).toBuffer(),
      ],
      toPublicKey(METADATA_PROGRAM_ID)
    )
  )[0];
}

const METADATA_REPLACE = new RegExp("\u0000", "g");
export const decodeMetadata = (buffer: Buffer): Metadata => {
  const metadata = deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer
  ) as Metadata;

  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, "");
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, "");
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, "");
  return metadata;
};
