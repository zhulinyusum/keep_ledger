use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("9QP6Q3sRRnNVP5YJft6xPp9wDU2oWjdEx4CBoUNRBHcp");
// 3HZCVTzLLYTFVu72jeV2wvsTGWcapoXjdogBA21nEoyA
#[program]
mod journal {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String
    ) -> Result<()> {
        msg!("Journal Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        title: String,
        message: String
    ) -> Result<()> {
        msg!("Journal Entry Updated");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;

        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Journal entry titled {} deleted", title);
        Ok(())
    }

    // pub fn create_ledger_entry(ctx: Context<CreateKeeping>, amount: u64) -> Result<()> {
    //     process_create_ledger(ctx, amount)
    // }

    pub fn create_ledger_entry(
        ctx: Context<CreateKeeping>,
        owner: Pubkey,
        keeping_num: u64,
        transaction_type:u8,
        amount: u64,
        category: Vec<String>,
        account_type: Vec<String>,
        // keeping_time: i64,
        member: String,
        merchant: String,
        project: String,
        comment: String,
        img: String
    ) -> Result<()> {
        msg!("create_ledger_entry transaction_type: {}", transaction_type);
        process_create_ledger(
            ctx,
            owner,
            keeping_num,
            transaction_type,
            amount,
            category,
            account_type,
            // keeping_time,
            member,
            merchant,
            project,
            comment,
            img
        )
        // Ok(())
    }

    pub fn update_ledger_entry(
        ctx: Context<UpdateKeeping>,
        // owner: Pubkey,
        keeping_num: u64,
        transaction_type: u8,
        amount: u64,
        category: Vec<String>,
        account_type: Vec<String>,
        // keeping_time: i64,
        member: String,
        merchant: String,
        project: String,
        comment: String,
        img: String
    ) -> Result<()> {
        process_update_ledger(
            ctx,
            // owner,
            keeping_num,
            transaction_type,
            amount,
            category,
            account_type,
            // keeping_time,
            member,
            merchant,
            project,
            comment,
            img
        )
    }
    pub fn delete_ledger_entry(ctx: Context<DeleteKeeping>,keeping_num: u64) -> Result<()> {
        process_delete_ledger(ctx,keeping_num)
    }
}

#[account]
pub struct JournalEntryState {
    pub owner: Pubkey,
    pub title: String,
    pub message: String,
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct CreateEntry<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + 4 + title.len() + 4 + message.len()
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        realloc = 8 + 32 + 4 + title.len() + 4 + message.len(),
        realloc::payer = owner, 
        realloc::zero = true, 
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account( 
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        close= owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
