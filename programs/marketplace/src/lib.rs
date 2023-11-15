use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_spl::associated_token::*;
use anchor_spl::token::{mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer};
declare_id!("7ZGGMgd86tKJosUZfT3ohHeAGkH7cGaWGf9DYSaYcDJv");

#[program]
pub mod marketplace {

    use super::*;
    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        let mint = &ctx.accounts.mint;
        let token_account = &ctx.accounts.token_account;
        let authority = &ctx.accounts.authority;
        // let system_program = &ctx.accounts.system_program;
        let token_program = &ctx.accounts.token_program;
        // let associated_token_program = &ctx.accounts.associated_token_program;

        let mint_to_cpi_account = MintTo {
            mint: mint.to_account_info().clone(),
            to: token_account.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };

        let mint_to_ctx = CpiContext::new(token_program.to_account_info(), mint_to_cpi_account);
        mint_to(mint_to_ctx, 1)?;
        Ok(())
    }

    pub fn exchange(ctx: Context<Exchange>, price: u64) -> Result<()> {
        let from_ata = &ctx.accounts.from_ata;
        let seller = &ctx.accounts.seller;
        let to_ata = &ctx.accounts.to_ata;
        let buyer = &ctx.accounts.buyer;
        let authority = &ctx.accounts.authority;
        let token_program = &ctx.accounts.token_program;
        let system_program = &ctx.accounts.system_program;

        // assert!(balance >= price, "Exchange");

        msg!("seller: {:?}", seller);
        msg!("seller data: {:?}", seller.lamports());
        msg!("seller: {:?}", seller.owner);
        msg!("from_ata: {:?}", from_ata.amount);
        // --- transfer sol ---
        // Create the transfer instruction
        let transfer_sol_instruction: anchor_lang::solana_program::instruction::Instruction =
            system_instruction::transfer(buyer.clone().key, seller.clone().key, price);

        // Invoke the transfer instruction
        anchor_lang::solana_program::program::invoke_signed(
            &transfer_sol_instruction,
            &[
                buyer.to_account_info().clone(),
                seller.to_account_info().clone(),
                system_program.to_account_info(),
            ],
            &[],
        )?;

        // transfer token to buyer
        let transfer_cpi_account = Transfer {
            from: from_ata.to_account_info().clone(),
            to: to_ata.to_account_info().clone(),
            authority: authority.to_account_info().clone(),
        };
        let transfer_program = token_program.to_account_info();
        let transfer_ctx = CpiContext::new(transfer_program, transfer_cpi_account);

        transfer(transfer_ctx, 1)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        init_if_needed,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority
    )]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Exchange<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: Account<'info, Mint>,
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
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
