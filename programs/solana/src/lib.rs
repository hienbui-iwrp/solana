use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Transfer};
declare_id!("8U2uMKTA35oa1tnQtrX7EfkbqXvNKjK8siAoX3wU9SVj");

#[program]
pub mod solana {

    use anchor_lang::solana_program::{entrypoint::ProgramResult, program::invoke_signed};
    use anchor_spl::token;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
    pub fn transfer_token(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
        let transfer_cpi = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let transfer_program = ctx.accounts.token_program.to_account_info();
        let transfer_ctx = CpiContext::new(transfer_program, transfer_cpi);
        msg!("---See here----");
        msg!("from: {:#?}", ctx.accounts.from);
        msg!("to: {:#?}", ctx.accounts.to);
        msg!("authority: {:#?}", ctx.accounts.authority);
        msg!(
            "token_program: {:#?}",
            ctx.accounts.token_program.to_account_info()
        );
        // let ins = spl_token::instruction::transfer(
        //     &ctx.accounts.token_program.key(),
        //     &ctx.accounts.from.key(),
        //     &ctx.accounts.to.key(),
        //     &ctx.accounts.authority.key(),
        //     &[],
        //     amount,
        // )?;
        // invoke_signed(
        //     &ins,
        //     &[
        //         ctx.accounts.token_program.to_account_info(),
        //         ctx.accounts.from.to_account_info(),
        //         ctx.accounts.to.to_account_info(),
        //         ctx.accounts.authority.to_account_info(),
        //     ],
        //     &[&[&[]]],
        // )
        token::transfer(transfer_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
