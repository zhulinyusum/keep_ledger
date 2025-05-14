import {
  JournalIDL,
  getJournalProgram,
  getJournalProgramId,
} from "@journal/anchor";
import { AnchorError, BN, Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../../../cluster/cluster-data-access";
import { useAnchorProvider } from "../../../solana/solana-provider";
import { useTransactionToast } from "../../../ui/ui-layout";
import { useMemo } from "react";
import { get } from "http";
import { Buffer } from "buffer";
import { useLedgerProgram } from "../new-ledger/ledger-data-access";

interface CreateLedgerEntryArgs {
  owner: PublicKey;
  keeping_num: BN;
  amount: BN;
  category: string[];
  accountType: String[];
  keeping_time: BN; // 固定8字节，无需限制
  member: string;
  merchant: string;
  project: String;
  comment: String;
  img: String;
}

export function useKeepingProgramAccount(
  { account }: { account: PublicKey }
) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useLedgerProgram();
  const programId = new PublicKey(
    "9QP6Q3sRRnNVP5YJft6xPp9wDU2oWjdEx4CBoUNRBHcp"
  );

  // 使用 useQuery 钩子来查询Journal账户的状态信息
  // const accountQuery = useQuery({
  //   // 定义查询的唯一键，包含集群和账户信息
  //   queryKey: ["ledger", "fetch", { cluster, account }],
  //   // 定义查询函数，用于获取账户的状态信息
  //   queryFn: () => {
  //     console.log(account.toString(), "accoun---------");
  //     const cc = program.account.keepingEntry.fetch(account);
  //     console.log(cc, "CCCC--------------------------------");
  //     console.log(cc.amount, "账户amont------------------------------------");
  //     return cc;
  //   },
  // });

  // 使用 useMutation 钩子来定义更新日志条目的操作
  const updateEntry = useMutation<string, Error, CreateLedgerEntryArgs>({
    // 定义变更的唯一键，包含集群信息
    mutationKey: ["ledgerEntry", "update", { cluster }],
    // 定义变更函数，用于更新日志条目

    mutationFn: async ({
      owner,
      amount, // amount,
      category,
      accountType,
      member,
      merchant,
      project,
      comment,
      img,
    }) => {
      const seeds = [
        Buffer.from("keeping_entry"), // 必须和Rust完全一致
        owner.toBuffer(),
        new BN(157).toArrayLike(Buffer, "le", 8),
      ];
      // 生成日志条目的唯一地址
      const [ledgerEntryAddress, bump] = await PublicKey.findProgramAddressSync(
        seeds,
        programId
      );

      // 调用程序方法来更新日志条目，并返回交易签名
      //TODO
      return program.methods
        .updateLedgerEntry(
          amount, // amount,
          category,
          accountType,
          member,
          merchant,
          project,
          comment,
          img
        )
        .accounts({
          owner, // 必须是钱包地址
          keeping: ledgerEntryAddress, // 可以是 PDA
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    // 在成功更新后，显示交易通知并重新获取账户信息
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    // 在更新失败时，显示错误通知
    onError: (error) => {
      toast.error(`Failed to update ledger entry: ${error.message}`);
    },
  });

  // 使用 useMutation 钩子来定义删除日志条目的操作
  const deleteEntry = useMutation({
    // 定义变更的唯一键，包含集群和账户信息
    mutationKey: ["ledger", "deleteEntry", { cluster, account }],
    // 定义变更函数，用于删除日志条目
    mutationFn: (keeping_num: BN) =>
      //TODO
      program.methods.deleteLedgerEntry(keeping_num).rpc(),
    // 在成功删除后，显示交易通知并重新获取账户信息
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  // 返回查询结果和操作日志条目的方法
  return {
    // accountQuery,
    updateEntry,
    deleteEntry,
  };
}
