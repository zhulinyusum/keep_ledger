import {
  JournalIDL,
  getJournalProgram,
  getJournalProgramId,
} from "@journal/anchor";
import { AnchorError, BN, Program } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../../../cluster/cluster-data-access";
import { useAnchorProvider } from "../../../solana/solana-provider";
import { useTransactionToast } from "../../../ui/ui-layout";
import { useMemo } from "react";
import { get } from "http";
import { Buffer } from "buffer";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { convertPrivateKeyToKeypair } from "../../convertKeypair";

export interface CreateLedgerEntryArgs {
  pda?: PublicKey;
  keeping_num: BN;
  transaction_type: BN;
  amount: BN;
  category: string[];
  account_type: string[];
  member: string;
  merchant: string;
  project: string;
  comment: string;
  img: string;
}

interface DeleteEntryArgs {
  pda: PublicKey;
  keeping_num: BN;
}
// async function createJournalEntry(
//   amount: number,
//   consumptionType: string[][],
//   moneyAccount: string,
//   members: string[],
//   merchants: string[],
//   project: string,
//   comment: string,
//   imgUrl: string
// ) {
//   const { publicKey } = useWallet();
//   const { cluster } = useCluster();
//   const programId = useMemo(
//     () => getJournalProgramId(cluster.network as Cluster),
//     [cluster]
//   );
//   // 转换金额到最小单位（如分）
//   const amountInCents = Math.round(amount * 100);
//   const provider = useAnchorProvider();
//   const program = getJournalProgram(provider);
//   const [entryPDA] = PublicKey.findProgramAddressSync(
//     [publicKey.toBuffer(), Buffer.from(comment.substring(0, 8))],
//     programId
//   );
//
//   await program.methods
//     .createEntry(
//       amountInCents,
//       consumptionType,
//       moneyAccount,
//       members,
//       merchants,
//       project,
//       comment,
//       imgUrl
//     )
//     .rpc();
// }

export function useLedgerProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getJournalProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getJournalProgram(provider);

  const accounts = useQuery({
    queryKey: ["ledger", "all", { cluster }],
    queryFn: async () => {
      console.log("IJJJDFSFFJJJ");

      const accounts = await connection.getProgramAccounts(programId);
      console.log("Total accounts:", accounts.length);

      // 检查 keepingEntry 账户
      const keepingAccounts = accounts.filter(
        (acc) => acc.account.data.length > 8 // 至少包含 8 字节的 Anchor discriminator
      );
      console.log("Initialized keepingEntry accounts:", keepingAccounts.length);
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      const result = await program.account.keepingEntry
        .all([
          {
            memcmp: {
              offset: 8, // owner字段在账户数据中的偏移量
              bytes: publicKey.toBase58(),
            },
          },
        ])
        // .fetch("BJEmjtEyqaQ1wW4kNeJLDLb5FACi6hv5NboryrAy7ehn")
        .then((data) => {
          console.log("Fetched entries:", data);
          return data || []; // 返回空数组作为回退
        })
        .catch((error) => {
          console.error("Failed to fetch entries:", error);
          return []; // 错误时返回空数组
        });

      console.log(result, "LEDGERcc");
      convertPrivateKeyToKeypair();
      // const cc = program.account.keepingEntry.all();
      console.log(result, "LEDGERcc");
      console.log(result.data, "data");
      // console.log(cc.data[0].account,"LEDGERccacount");
      result.data?.map((account) => {
        console.log(
          account.publicKey.toString(),
          "账户------------------------------------"
        );
        console.log(
          account.account.title,
          "数据------------------------------------"
        );
      });
      console.log(result, "---------------------------");
      return result;
    },
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createLedgerEntry = useMutation<string, Error, CreateLedgerEntryArgs>({
    mutationKey: ["keeping_entry", "create", { cluster }],
    mutationFn: async ({
      // pda,
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
      img,
    }) => {
      // console.log(pda.toString(), "pda");
      console.log(programId.toString(), "程序ID");
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }
      const seeds = [
        Buffer.from("keeping_entry"), // 必须和Rust完全一致
        publicKey.toBuffer(),
        keeping_num.toArrayLike(Buffer, "le", 8),
      ];
      const [pda, bump] = await PublicKey.findProgramAddressSync(
        seeds,
        programId
      );
      console.log("pdddd.t:", pda.toBase58());

      // console.log("Generated PDA:", pda.toString());
      console.log("Actual seeds:", {
        prefix: "keeping_entry",
        // pda: pda.toString(),
        keeping_num: keeping_num,
        keeping_num_bytes: Array.from(keeping_num.toArrayLike(Buffer, "le", 8)), // 显示字节数组
      });
      if (!pda) {
        throw new Error("Wallet not connected");
      }
      return program.methods
        .createLedgerEntry(
          publicKey,
          keeping_num,
          transaction_type,
          amount, // amount,
          category,
          account_type,
          // keeping_time, // keeping_time,
          member,
          merchant,
          project,
          comment,
          img
        )
        .accounts({
          owner:publicKey, // 必须是钱包地址
          keeping_entry: pda, // 可以是 PDA
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("交易成功:");
    },
    onSuccess: (signature) => {
      console.log("交易成功:", signature);
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create ledger entry: ${error.message}`);
      toast.error(`Failed to create ledger entry: ${error}`);
      toast.error(`Failed to create ledger entry: ${error.stack}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createLedgerEntry,
  };
}

export function useLedgerProgramAccount({ pda }: { pda: PublicKey }) {
  const { cluster } = useCluster();
  const { publicKey } = useWallet();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useLedgerProgram();
  const programId = new PublicKey(
    "9QP6Q3sRRnNVP5YJft6xPp9wDU2oWjdEx4CBoUNRBHcp"
  );

  if (!publicKey) {
    throw new Error("Wallet not connected");
  }

  // 使用 useQuery 钩子来查询Ledger账户的状态信息
  const accountQuery = useQuery({
    // 定义查询的唯一键，包含集群和账户信息
    queryKey: ["ledger", "fetch", { cluster, pda }],
    // 定义查询函数，用于获取账户的状态信息
    queryFn: () => {
      console.log(pda.toString(), "accoun---------");
      const cc = program.account.keepingEntry.fetch(pda);
      console.log(cc, "CCCC--------------------------------");
      console.log(program.account, "-------program.account----------");
      return cc;
    },
  });

  // 使用 useMutation 钩子来定义更新日志条目的操作
  const updateLedgerEntry = useMutation<string, Error, CreateLedgerEntryArgs>({
    // 定义变更的唯一键，包含集群信息
    mutationKey: ["ledgerEntry", "update", { cluster }],
    // 定义变更函数，用于更新日志条目

    mutationFn: async ({
      pda,
      keeping_num,
      transaction_type,
      amount, // amount,
      category,
      account_type,
      member,
      merchant,
      project,
      comment,
      img,
    }) => {
      // const seeds = [
      //   Buffer.from("keeping_entry"), // 必须和Rust完全一致
      //   owner.toBuffer(),
      //   new BN(160).toArrayLike(Buffer, "le", 8),
      // ];
      // 生成日志条目的唯一地址
      // const [ledgerEntryAddress, bump] = await PublicKey.findProgramAddressSync(
      //   seeds,
      //   programId
      // );

      if (!pda) {
        throw new Error("Wallet not connected");
      }

      // 调用程序方法来更新日志条目，并返回交易签名
      //TODO
      return program.methods
        .updateLedgerEntry(
          // owner,
          keeping_num,
          transaction_type,
          amount, // amount,
          category,
          account_type,
          member,
          merchant,
          project,
          comment,
          img
        )
        .accounts({
          publicKey, // 必须是钱包地址
          keeping_entry: pda, // 可以是 PDA
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
  const deleteLedgerEntry = useMutation<string, Error, DeleteEntryArgs>({
    // 定义变更的唯一键，包含集群和账户信息
    mutationKey: ["ledger", "deleteLedgerEntry", { cluster, pda }],

    // 定义变更函数，用于删除日志条目
    mutationFn: async ({ pda, keeping_num }) => {
      // pda.toString().slice(0, 8);
      console.log(pda.toString(), "owner account钱包");
      console.log(keeping_num, "keeping_num-----------------");
      const seeds = [
        Buffer.from("keeping_entry"), // 必须和Rust完全一致
        publicKey.toBuffer(),
        keeping_num.toArrayLike(Buffer, "le", 8),
      ];
      // const c = keeping_num.toArrayLike(Buffer, "le", 8);
      // 生成日志条目的唯一地址
      const [ledgerEntryAddress, bump] = await PublicKey.findProgramAddressSync(
        seeds,
        programId
      );
      console.log(ledgerEntryAddress.toString(), "ledgerEntryAddres1111--");
      const result = program.methods
        .deleteLedgerEntry(keeping_num)
        .accounts({
          publicKey, // 必须是钱包地址
          keeping_entry: pda, // 可以是 PDA
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      return result;
    },

    // 在成功删除后，显示交易通知并重新获取账户信息
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
  });

  // 返回查询结果和操作日志条目的方法
  return {
    accountQuery,
    updateLedgerEntry,
    deleteLedgerEntry,
  };
}

// async function updateJournalEntry(
//   entryPDA: PublicKey,
//   newAmount: number,
//   newComment: string
// ) {
//   await program.methods
//     .updateLedgerEntry(Math.round(newAmount * 100), newComment)
//     .accounts({
//       entry: entryPDA,
//       owner: publicKey,
//     })
//     .rpc();
// }
//
// async function deleteJournalEntry(entryPDA: PublicKey) {
//   await program.methods
//     .deleteLedgerEntry()
//     .accounts({
//       entry: entryPDA,
//       owner: wallet.publicKey,
//     })
//     .rpc();
// }
//
// // 查询单个条目
// async function getJournalEntry(entryPDA: PublicKey) {
//   return await program.account.keepingEntry.fetch(entryPDA);
// }
//
// 查询用户所有条目
// async function getUserEntries(owner: PublicKey) {
//   return await program.account.keepingEntry.all([
//     {
//       memcmp: {
//         offset: 0, // owner字段在账户数据中的偏移量
//         bytes: owner.toBase58(),
//       },
//     },
//   ]);
// }
