use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};
declare_id!("eKQ8XYLQV7n5NCrNpsivGx8Y6jFyNN5qPDj7KCk4SRw");

#[program]
pub mod solana {

    use anchor_lang::solana_program::{entrypoint::ProgramResult, program::invoke_signed};
    use anchor_spl::token;

    use super::*;

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
    pub fn transfer_spl_tokens(ctx: Context<TransferSpl>, amount: u64) -> Result<()> {
        let destination = &ctx.accounts.to_ata;
        let source = &ctx.accounts.from_ata;
        let token_program = &ctx.accounts.token_program;
        let authority = &ctx.accounts.from;

        // Transfer tokens from taker to initializer
        let cpi_accounts = Transfer {
            from: source.to_account_info().clone(),
            to: destination.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };
        let cpi_program = token_program.to_account_info();

        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;
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

#[derive(Accounts)]
pub struct TransferSpl<'info> {
    pub from: Signer<'info>,
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}
