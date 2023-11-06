use anchor_lang::prelude::*;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};
declare_id!("8U2uMKTA35oa1tnQtrX7EfkbqXvNKjK8siAoX3wU9SVj");

#[program]
pub mod solana {

    use anchor_lang::solana_program::system_instruction;

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

        transfer(transfer_ctx, amount)?;
        Ok(())
    }

    pub fn get_token_account(ctx: Context<GetTokenAccount>) -> Result<Pubkey> {
        let owner = &ctx.accounts.owner;
        let mint = &ctx.accounts.mint;
        let ata = get_associated_token_address(&owner.key(), &mint.key());
        msg!("ata: {}", ata.clone());
        Ok(ata)
    }

    pub fn exchange(ctx: Context<Exchange>, price: u64) -> Result<()> {
        let from_ata = &ctx.accounts.from_ata;
        let seller = &ctx.accounts.seller;
        let to_ata = &ctx.accounts.to_ata;
        let buyer = &ctx.accounts.buyer;
        let authority = &ctx.accounts.authority;
        let token_program = &ctx.accounts.token_program;
        let system_program = &ctx.accounts.system_program;

        msg!("seller: {:?}", seller);
        msg!("seller data: {:?}", seller.lamports());
        msg!("seller: {:?}", seller.owner);
        // --- transfer sol ---
        // // Create the transfer instruction
        // let transfer_sol_instruction =
        //     system_instruction::transfer(buyer.clone().key, seller.clone().key, price);

        // // Invoke the transfer instruction
        // anchor_lang::solana_program::program::invoke_signed(
        //     &transfer_sol_instruction,
        //     &[
        //         seller.to_account_info(),
        //         buyer.to_account_info(),
        //         system_program.to_account_info(),
        //     ],
        //     &[],
        // )?;

        // // transfer token to buyer
        // let transfer_cpi_account = Transfer {
        //     from: from_ata.to_account_info().clone(),
        //     to: to_ata.to_account_info().clone(),
        //     authority: authority.to_account_info().clone(),
        // };
        // let transfer_program = token_program.to_account_info();
        // let transfer_ctx = CpiContext::new(transfer_program, transfer_cpi_account);

        // transfer(transfer_ctx, 1)?;
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
pub struct GetTokenAccount<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub owner: AccountInfo<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct Exchange<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub from_ata: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub to_ata: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub buyer: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
