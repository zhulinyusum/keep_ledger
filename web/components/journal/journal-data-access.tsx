"use client";
// 传入泛型类型
import {
  getJournalProgram,
  getJournalProgramId,
  JournalIDL,
} from "@journal/anchor";
import { Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { useMemo } from "react";
import { get } from "http";
interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

/**
 * 钩子函数，用于管理日志程序的相关状态和操作
 * 主要功能包括：获取日志程序ID、查询日志条目状态、获取程序账户信息、创建日志条目
 *
 * @returns 返回包含日志程序相关操作和状态的对象
 */
export function useJournalProgram() {
  // 获取Solana连接对象
  const { connection } = useConnection();
  // 获取当前集群信息
  const { cluster } = useCluster();
  // 用于显示交易通知的函数
  const transactionToast = useTransactionToast();
  // 获取Anchor Provider实例
  const provider = useAnchorProvider();

  // 根据集群网络动态获取日志程序ID
  const programId = useMemo(
    () => getJournalProgramId(cluster.network as Cluster),
    [cluster]
  );

  // 初始化日志程序
  const program = getJournalProgram(provider);

  // 查询所有日志条目状态
  const accounts = useQuery({
    queryKey: ["journal", "all", { cluster }],
    queryFn: () => {
      const cc = program.account.journalEntryState.all();
      console.log("IJJJJJJ",program.account.journalEntryState);
      cc.data?.map((account) => {
        console.log(account.publicKey.toString(),"账户------------------------------------");
        console.log(account.account.title,"数据------------------------------------");
      })
      console.log(cc,"---------------------------");
      return cc;
    },
  });

  // 查询特定程序账户信息
  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // 创建日志条目的突变操作
  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["journalEntry", "create", { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      // 生成日志条目地址
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );
      // 调用程序方法创建日志条目并返回交易签名
      return program.methods.createJournalEntry(title, message).rpc();
    },
    // 创建成功后的处理
    onSuccess: (signature) => {
      // 显示交易通知
      transactionToast(signature);
      // 重新获取日志条目状态
      accounts.refetch();
    },
    // 创建失败后的处理
    onError: (error) => {
      // 显示错误通知
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });

  // 返回日志程序相关操作和状态
  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
}


/**
 * 使用Journal程序账户的钩子
 *
 * 此钩子用于与Journal程序交互，提供了一种方式来查询账户状态、更新日志条目和删除日志条目
 * 它依赖于Solana区块链的 PublicKey 来标识账户和程序
 *
 * @param {Object} params - 包含账户 PublicKey 的对象
 * @param {PublicKey} params.account - 需要查询的账户标识符
 * @returns {Object} 包含账户查询结果、更新日志条目和删除日志条目的方法的对象
 */
export function useJournalProgramAccount({ account }: { account: PublicKey }) {
  // 使用 useCluster 钩子来获取当前的 Solana 集群信息
  const { cluster } = useCluster();
  // 使用 useTransactionToast 钩子来获取交易通知功能
  const transactionToast = useTransactionToast();
  // 使用 useJournalProgram 钩子来获取Journal程序实例和相关账户信息
  const { program, accounts } = useJournalProgram();
  // 定义Journal程序的唯一标识符
  const programId = new PublicKey(
    "9QP6Q3sRRnNVP5YJft6xPp9wDU2oWjdEx4CBoUNRBHcp"
  );

  // 使用 useQuery 钩子来查询Journal账户的状态信息
  const accountQuery = useQuery({
    // 定义查询的唯一键，包含集群和账户信息cc
    queryKey: ["journal", "fetch", { cluster, account }],
    // 定义查询函数，用于获取账户的状态信息
    queryFn: () => {
      const cc = program.account.journalEntryState.fetch(account);
      console.log("ccnn",cc);
      console.log("ccD",cc.title);
      return cc;
    },
  });

  // 使用 useMutation 钩子来定义更新日志条目的操作
  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    // 定义变更的唯一键，包含集群信息
    mutationKey: ["journalEntry", "update", { cluster }],
    // 定义变更函数，用于更新日志条目
    mutationFn: async ({ title, message, owner }) => {
      // 生成日志条目的唯一地址
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );

      // 调用程序方法来更新日志条目，并返回交易签名
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    // 在成功更新后，显示交易通知并重新获取账户信息
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    // 在更新失败时，显示错误通知
    onError: (error) => {
      toast.error(`Failed to update journal entry: ${error.message}`);
    },
  });

  // 使用 useMutation 钩子来定义删除日志条目的操作
  const deleteEntry = useMutation({
    // 定义变更的唯一键，包含集群和账户信息
    mutationKey: ["journal", "deleteEntry", { cluster, account }],
    // 定义变更函数，用于删除日志条目
    mutationFn: (title: string) =>
      program.methods.deleteJournalEntry(title).rpc(),
    // 在成功删除后，显示交易通知并重新获取账户信息
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  // 返回查询结果和操作日志条目的方法
  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}

