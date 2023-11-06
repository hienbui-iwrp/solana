use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};
declare_id!("8U2uMKTA35oa1tnQtrX7EfkbqXvNKjK8siAoX3wU9SVj");

#[program]
pub mod solana {

    use anchor_lang::solana_program::{entrypoint::ProgramResult, program::invoke_signed};
    use anchor_spl::token;

    use super::*;

    pub fn transfer_token(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
        let to = &ctx.accounts.to;
        let from = &ctx.accounts.from;
        let token_program = &ctx.accounts.token_program;
        let authority = &ctx.accounts.authority;

        let transfer_cpi_account = Transfer {
            from: from.to_account_info().clone(),
            to: to.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };
        let transfer_program = token_program.to_account_info();
        let transfer_ctx = CpiContext::new(transfer_program, transfer_cpi_account);

        token::transfer(transfer_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
