use anchor_lang::prelude::*;
// 创建记账条目

pub fn process_create_ledger(
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
    let keeping_entry = &mut ctx.accounts.keeping_entry;
    // msg!("KeepingEntry Discriminator: {:?}", KeepingEntry::discriminator());
    // msg!("This is a debug message------------");
    // msg!("Creating a new ledger entry: {:?}", keeping_entry);
    // msg!("This is a debug message-----------====");

    // let keeping_entry = &mut ctx.accounts.keeping_entry;
    // keeping_entry.owner = ctx.accounts.owner.key();
    // msg!("Legers Entry Created");
    // msg!("keeping_num: {}", keeping_num);
    // msg!("ownerTOSTRING: {}", owner.to_string());
    // msg!("owner: {}", owner);

    // msg!("keeping_num.to_le_bytes().as_ref(): {:?}", keeping_num.to_le_bytes().as_ref());
    // msg!("keeping_num.to_le_bytes(): {:?}", keeping_num.to_le_bytes());

    // let program_address = match
    //     Pubkey::from_str("GT5xS2g9DNnN4hGigGGq5oaeGJ9eSQz6xRCvuYnchQyB")
    // {
    //     Ok(addr) => addr,
    //     Err(_) => {
    //         return Err(ErrorCode::InvalidPubkey.into());
    //     } // 自定义错误
    // };

    // // let optional_seed_address = Pubkey::from_str("4SgQeHzWXzvfBTjpkehrk4tieLas3ULR74fHKndH9bUV")?;
    // let optional_seed_bytes = b"keeping_entry9";
    // let binding = keeping_num.to_le_bytes();
    // let binding_owner = owner.key();
    // let seeds: &[&[u8]] = &[optional_seed_bytes, binding.as_ref(), binding_owner.as_ref()];
    // let seeds2: &[&[u8]] = &[optional_seed_bytes];
    // // let seeds: &[&[u8]] = &[optional_seed_bytes, &keeping_num.to_le_bytes(),owner.key().as_ref()];
    // let (pda, bump) = Pubkey::find_program_address(seeds, &program_address);
    // let (pda2, bump2) = Pubkey::find_program_address(seeds2, &program_address);

    // // console.log("TS programId:", program.programId.toString());
    // msg!("keeping_num bytes len: {}", keeping_num.to_le_bytes().len()); // 应为8
    // msg!("Current program_id: {}", ctx.program_id);
    // msg!("PDA---TEST: {}", pda);
    // msg!("Bump---TEST: {}", bump);

    // msg!("PDA2---TEST: {}", pda2);
    // msg!("Bump2---TEST: {}", bump2);

    keeping_entry.owner = ctx.accounts.owner.key();
    keeping_entry.keeping_num = keeping_num;
    keeping_entry.transaction_type=transaction_type;
    keeping_entry.amount = amount;
    keeping_entry.category = category;
    keeping_entry.account_type = account_type;
    keeping_entry.keeping_time = Clock::get()?.unix_timestamp;
    keeping_entry.member = member;
    keeping_entry.merchant = merchant;
    keeping_entry.project = project;
    keeping_entry.comment = comment;
    keeping_entry.img = img;
    Ok(())
}

// 更新记账条目
pub fn process_update_ledger(
    ctx: Context<UpdateKeeping>,
    // owner: Pubkey,
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
    require!(ctx.accounts.keeping_entry.owner == ctx.accounts.owner.key(), ErrorCode::Unauthorized);

    let keeping_entry = &mut ctx.accounts.keeping_entry;
    keeping_entry.owner = ctx.accounts.owner.key();
    keeping_entry.keeping_num = keeping_num;
    keeping_entry.transaction_type = transaction_type;
    keeping_entry.amount = amount;
    keeping_entry.category = category;
    keeping_entry.account_type = account_type;
    keeping_entry.keeping_time = Clock::get()?.unix_timestamp;
    keeping_entry.member = member;
    keeping_entry.merchant = merchant;
    keeping_entry.project  = project;
    keeping_entry.comment = comment;
    keeping_entry.img = img;
    Ok(())
}

// 删除记账条目
pub fn process_delete_ledger(ctx: Context<DeleteKeeping>,keeping_num:u64) -> Result<()> {
    require!(ctx.accounts.keeping_entry.owner == ctx.accounts.owner.key(), ErrorCode::Unauthorized);
    // Anchor 会自动回收账户空间
    Ok(())
}

// 错误码
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("InvalidPubkey")]
    InvalidPubkey,
}

#[derive(Accounts)]
#[instruction(
    owner:Pubkey,
    keeping_num:u64,
    transaction_type:u8,    
    amount: u64,
    category: Vec<String>,
    account_type: Vec<String>,
    // keeping_time: i64,
    member: String,
    merchant: String,
    project: String,
    comment: String,
    img: String)] // 添加指令参数注解
pub struct CreateKeeping<'info> {
    #[account(
        init,
        seeds = [b"keeping_entry", owner.key().as_ref(), keeping_num.to_le_bytes().as_ref()],
        bump,
        space = 8 + KeepingEntry::INIT_SPACE,
        payer = owner
    )]
    pub keeping_entry: Account<'info, KeepingEntry>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    // owner:Pubkey,
    keeping_num:u64,
    transaction_type:u8,    
    amount: u64,
    category: Vec<String>,
    account_type: Vec<String>,
    // keeping_time: i64,
    member: String,
    merchant: String,
    project: String,
    comment: String,
    img: String)] 
pub struct UpdateKeeping<'info> {
    #[account(
        mut,
        seeds = [b"keeping_entry", owner.key().as_ref(), keeping_num.to_le_bytes().as_ref()],  // 添加PDA种子
        bump ,
        realloc=  8 +  KeepingEntry::INIT_SPACE,
        realloc::payer =owner,
        realloc::zero =true,
    )]
    pub keeping_entry: Account<'info, KeepingEntry>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(keeping_num: u64)]
pub struct DeleteKeeping<'info> {
    #[account(
        mut,
        seeds = [b"keeping_entry", owner.key().as_ref(), keeping_num.to_le_bytes().as_ref()],  // 添加PDA种子
        bump ,
        close = owner,
    )]
    pub keeping_entry: Account<'info, KeepingEntry>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct KeepingEntry {
    pub owner: Pubkey, // 固定32字节，无需限制
    pub keeping_num: u64,
    pub transaction_type:u8,
    pub amount: u64, // 固定8字节，无需限制
    #[max_len(10, 5)] // 3主分类×2子分类=6
    pub category: Vec<String>,
    #[max_len(10, 5)] // 账户名称最多50字符
    pub account_type: Vec<String>,
    pub keeping_time: i64, // 记账时间 固定8字节，无需限制
    #[max_len(10)] // 最多5个成员
    pub member: String,
    #[max_len(10)] // 最多10个商家
    pub merchant: String,
    #[max_len(40)] // 项目名最多40字符
    pub project: String,
    #[max_len(100)] // 备注最多100字符
    pub comment: String,
    #[max_len(150)] // 图片URL最多150字符
    pub img: String,
}


