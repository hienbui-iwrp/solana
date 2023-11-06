export type Solana = {
  "version": "0.1.0",
  "name": "solana",
  "instructions": [
    {
      "name": "transferToken",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getTokenAccount",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": "publicKey"
    }
  ]
};

export const IDL: Solana = {
  "version": "0.1.0",
  "name": "solana",
  "instructions": [
    {
      "name": "transferToken",
      "accounts": [
        {
          "name": "from",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getTokenAccount",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": "publicKey"
    }
  ]
};
