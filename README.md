_Setup project_

- Create `.env` file and fill in private keys (see in `.ent.txt` file)
- Create `.wallet/master.json` and write your account keypair in base58. This account will be used for deploy program
- Run:

```bash
yarn
```

_Build program_ -

```bash
anchor build
```

_Deploy program_

```bash
anchor build
```

After deploy successfully, you can see `program Id` line. Copy this line and update files:

- `programs/marketplace/src/lib.rs`: update `declare_id!(<program Id>)`
- `Anchor.toml`: update `marketplace = <program Id>` in `[programs.devnet]` tag
- `tests/config.json`: update `"programId": <program Id>`

_Test program_

```bash
anchor test
```
