use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::{
    instruction::create_metadata_accounts_v3, pda::find_metadata_account, state::DataV2,
};

declare_id!("B5rSEHZKKZqKUjb5KBLViv4TVS7U6acbENbC5RBKGJvJ");

#[program]
pub mod solana_nft {

    use anchor_lang::solana_program::{program::invoke_signed, system_instruction, system_program};

    use super::*;

    pub fn init_nft(ctx: Context<InitNFT>, param: InitNFTParam) -> ProgramResult {
        let signer = &ctx.accounts.signer;
        let mint = &ctx.accounts.mint;
        let associated_token_account = &ctx.accounts.associated_token_account;
        let metadata_account = &ctx.accounts.metadata_account;
        let token_program = &ctx.accounts.token_program;
        let associated_token_program = &ctx.accounts.associated_token_program;
        let token_metadata_program = &ctx.accounts.token_metadata_program;
        let system_program = &ctx.accounts.system_program;
        let rent = &ctx.accounts.rent;
        let other = &ctx.accounts.other;

        // create mint account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        );

        mint_to(cpi_context, 1)?;

        let instruction = create_metadata_accounts_v3(
            *token_metadata_program.key,
            *metadata_account.key,
            mint.key(),
            *signer.key,
            *signer.key,
            *signer.key,
            param.name,
            param.symbol,
            param.uri,
            None,
            0,
            false,
            false,
            None,
            None,
            None,
        );
        invoke_signed(
            &instruction,
            &[
                signer.to_account_info().clone(),
                other.to_account_info().clone(),
                // token_metadata_program.to_account_info().clone(),
                metadata_account.to_account_info().clone(),
                mint.to_account_info().clone(),
                // associated_token_account.to_account_info(),
                // rent.to_account_info(),
                // token_program.to_account_info(),
                // system_program.to_account_info(),
                // associated_token_program.to_account_info(),
            ],
            &[
                // &[
                //     b"metadata",
                //     &token_metadata_program.key().to_bytes(),
                //     &mint.key().to_bytes(),
                // ],
                // &[&[param.bump]],
            ],
        )
        // let result = invoke_signed(&instruction, &[], &[&[]]);
        // result
        // msg!("mint: {}", ctx.accounts.mint.key());

        // Ok(())
    }

    pub fn trasnfer(ctx: Context<Trasnfer>) -> ProgramResult {
        let sender = &ctx.accounts.sender;
        let receiver = &ctx.accounts.receiver;
        let system_program = &ctx.accounts.system_program;
        let other = &ctx.accounts.other;

        let transfer_sol_instruction: anchor_lang::solana_program::instruction::Instruction =
            system_instruction::transfer(sender.key, receiver.key, 1000000000);

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_sol_instruction,
            &[
                receiver.to_account_info(),
                // system_program.to_account_info(),
                // other.to_account_info(),
                sender.to_account_info(),
            ],
            &[],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(
    param: InitNFTParam
)]
pub struct InitNFT<'info> {
    /// CHECK: ok, we are passing in this account ourselves
    #[account(mut, signer)]
    pub signer: AccountInfo<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = param.decimals,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer
    )]
    pub associated_token_account: Account<'info, TokenAccount>,
    ///CHECK:
    #[account(
        mut,
        // address=find_metadata_account(&mint.key()).0
    )]
    pub metadata_account: AccountInfo<'info>,
    // /// CHECK: address
    // #[account(mut)]
    // pub master_edition_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK
    pub token_metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK
    #[account(mut)]
    pub other: AccountInfo<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct InitNFTParam {
    name: String,
    uri: String,
    symbol: String,
    decimals: u8,
    bump: u8,
}

#[derive(Accounts)]
pub struct Trasnfer<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    #[account(mut)]
    pub other: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}
