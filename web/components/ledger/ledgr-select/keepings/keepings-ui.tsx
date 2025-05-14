
"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCluster } from "../../../cluster/cluster-data-access";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  CreateLedgerEntryArgs,
  useLedgerProgram,
  useLedgerProgramAccount,
} from "../new-ledger/ledger-data-access";
import { useKeepingProgramAccount } from "./keepings-data-access";
import Modal from "react-modal";
import { LedgerCreate } from "../new-ledger/ledger-ui";
import { LedgerCard } from "../new-ledger/ledger-ui";
import { ReportContent } from "./report-ui";
import { HomeContent } from "./keepings-home-ui";

// 定义右侧内容的组件
// const HomeContent = () => <div className="text-gray-700">欢迎访问主页</div>;
// const ReportContent = () => <div className="text-gray-700">这是报表页面</div>;
const DetailsContent = () => (
  <div className="text-gray-700">这是收支明细页面</div>
);
const AssetsContent = () => (
  <div className="text-gray-700">这是资产概况页面</div>
);
const AccountsContent = () => (
  <div className="text-gray-700">这是账户管理页面</div>
);

interface LedgerEntry {
  account: {
    amount?: { toNumber: () => number };
    transactionType: number;
  };
}

// 定义 accounts 数据的类型
interface AccountsData {
  data?: LedgerEntry[];
}

// 导出 calculateTotals 方法，接受 accounts 作为参数
export const calculateTotals = (accounts: AccountsData) => {
  let totalIncome = 0;
  let totalExpense = 0;

  if (accounts.data) {
    accounts.data.forEach((entry: LedgerEntry) => {
      const amount = entry.account.amount?.toNumber() || 0;
      const transactionType = entry.account.transactionType;

      if (transactionType === 1) {
        totalIncome += amount;
      } else if (transactionType === 0) {
        totalExpense += amount;
      }
    });
  }

  return { totalIncome, totalExpense };
};

// 提取流水记录的内容为独立组件
function KeepingListContent({
  setIsModalOpen,
}: {
  setIsModalOpen: (value: boolean) => void;
}) {
  const { publicKey } = useWallet();
  const { program, accounts, getProgramAccount } = useLedgerProgram();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<string>("");

  const categories = ["餐饮", "交通", "购物", "娱乐", "医疗", "教育"];
  const accountTypes = ["现金", "支付宝", "微信钱包", "银行卡", "信用卡"];
  const transactionTypes = ["收入", "支出"];
  const { totalIncome, totalExpense } = calculateTotals(accounts);
  // useEffect(() => {
  //   // 使用工具函数计算收入、支出和余额
  //   const { totalIncome, totalExpense } = calculateTotals(accounts);
  //   setIncome(totalIncome);
  //   setExpense(totalExpense);
  //   setBalance(totalIncome - totalExpense);
  // }, [accounts.data]);

  // const calculateTotals = () => {
  //   let totalIncome = 0;
  //   let totalExpense = 0;

  //   if (accounts.data) {
  //     accounts.data.forEach((entry: any) => {
  //       const amount = entry.account.amount?.toNumber() || 0;
  //       const transactionType = entry.account.transactionType;

  //       if (transactionType === 1) {
  //         totalIncome += amount;
  //       } else if (transactionType === 2) {
  //         totalExpense += amount;
  //       }
  //     });
  //   }

  //   return { totalIncome, totalExpense };
  // };

  const balance = totalIncome - totalExpense;

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}年${
      today.getMonth() + 1
    }月${today.getDate()}日`;
    setStartDate(formattedDate);
  }, []);

  const filteredAccounts = accounts.data
    ? {
        ...accounts,
        data: accounts.data.filter((entry: any) => {
          const keepingTime = entry.account.keepingTime?.toNumber() * 1000;
          const category = entry.account.category?.[0] || "";
          const accountType = entry.account.accountType?.[0] || "";
          const comment = entry.account.comment?.toLowerCase() || "";
          const amount = entry.account.amount?.toString() || "";
          const transactionType =
            entry.account?.transactionType === 1 ? "收入" : "支出";

          const start = startDate
            ? new Date(
                startDate.replace(/年|月/g, "-").replace("日", "")
              ).getTime()
            : -Infinity;
          const end = endDate
            ? new Date(
                endDate.replace(/年|月/g, "-").replace("日", "")
              ).getTime()
            : Infinity;
          const isInDateRange = keepingTime >= start && keepingTime <= end;

          const matchesCategory = selectedCategory
            ? category === selectedCategory
            : true;
          const matchesAccountType = selectedAccountType
            ? accountType === selectedAccountType
            : true;
          const matchesTransactionType = selectedTransactionType
            ? transactionType === selectedTransactionType
            : true;
          const matchesSearch = searchTerm
            ? comment.includes(searchTerm.toLowerCase()) ||
              amount.includes(searchTerm)
            : true;

          return (
            isInDateRange &&
            matchesCategory &&
            matchesAccountType &&
            matchesTransactionType &&
            matchesSearch
          );
        }),
      }
    : accounts;

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const resetFilters = () => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}年${
      today.getMonth() + 1
    }月${today.getDate()}日`;
    setStartDate(formattedDate);
    setEndDate("");
    setSelectedCategory("");
    setSelectedAccountType("");
    setSelectedTransactionType("");
    setSearchTerm("");
  };

  if (!publicKey) {
    return (
      <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
        <span>请连接钱包以查看流水记录</span>
      </div>
    );
  }

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-purple-500"></span>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
        <span>找不到程序账户。请确保已部署程序并处于正确的集群。</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-orange-600">流水记录</h1>
          <div className="text-sm text-gray-600 mt-1">
            流水列表 {"  "}
            结余{" "}
            <span className="text-orange-600">{formatAmount(balance)}</span> |
            收入{" "}
            <span className="text-orange-600">{formatAmount(totalIncome)}</span>{" "}
            | 支出{" "}
            <span className="text-orange-600">
              {formatAmount(totalExpense)}
            </span>{" "}
            | 总计{" "}
            <span className="text-orange-600">
              {formatAmount(totalIncome + totalExpense)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-orange-600 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            新增收入/支出
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索备注或金额..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 pl-3 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <img
            src="/avatar.png"
            alt=" "
            // alt="用户"
            className="w-8 h-8 rounded-full border border-gray-200"
          />
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">筛选条件</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="请输入日期（格式：2025年5月12日）"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="请输入日期（格式：2025年5月12日）"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              分类
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">全部</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              账户类型
            </label>
            <select
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">全部</option>
              {accountTypes.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              收支类型
            </label>
            <select
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">全部</option>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={resetFilters}
            className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-sm hover:bg-gray-400"
          >
            重置筛选
          </button>
        </div>
      </div>

      <div className="space-y-8 py-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <TableHeader />
            <tbody>
              {filteredAccounts.data?.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="border border-gray-300 p-3 text-center text-gray-500"
                  >
                    暂无数据
                  </td>
                </tr>
              )}

              {filteredAccounts.isLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="border border-gray-300 p-3 text-center"
                  >
                    <span className="loading loading-spinner loading-lg text-purple-500"></span>
                  </td>
                </tr>
              ) : filteredAccounts.data?.length ? (
                filteredAccounts.data.map((pda: { publicKey: PublicKey }) => (
                  <KeepingCard
                    key={pda.publicKey.toString()}
                    pda={pda.publicKey}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="border border-gray-300 p-3 text-center text-gray-500"
                  >
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KeepingCard({ pda }: { pda: PublicKey }) {
  const { publicKey } = useWallet();
  const { accountQuery, deleteLedgerEntry } = useLedgerProgramAccount({ pda });

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formattedDate;
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleDelete = async (pda: PublicKey) => {
    if (!publicKey) {
      alert("请连接钱包");
      return;
    }
    if (!deleteLedgerEntry) {
      console.error("deleteLedgerEntry 未定义或不可用");
      alert("删除功能不可用，请检查配置");
      return;
    }
    try {
      console.log(`正在删除 ${pda}`);
      const keeping_num = accountQuery.data?.keepingNum;
      await deleteLedgerEntry.mutateAsync({
        pda: pda,
        keeping_num: keeping_num,
      });
    } catch (error) {
      console.error("删除账本条目失败:", error);
      alert("删除失败，请查看控制台");
    }
  };

  if (accountQuery.isLoading) {
    return (
      <tr>
        <td colSpan={11} className="border border-gray-300 p-3 text-center">
          <span className="loading loading-spinner loading-md text-purple-500"></span>
        </td>
      </tr>
    );
  }

  if (!accountQuery.data) {
    return (
      <tr>
        <td
          colSpan={11}
          className="border border-gray-300 p-3 text-center text-gray-500"
        >
          暂无数据
        </td>
      </tr>
    );
  }

  return (
    <tr
      key={accountQuery.data?.keepingNum}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="border border-gray-300 p-3">
        {formatDate(accountQuery.data?.keepingTime?.toNumber() || 0)}
      </td>
      <td className="border border-gray-300 p-3 text-red-600">
        {formatAmount(accountQuery.data?.amount?.toNumber() || 0)}
      </td>
      <td className="border border-gray-300 p-3">
        {accountQuery.data?.category?.join(", ") || "无分类"}
      </td>
      <td className="border border-gray-300 p-3">
        {accountQuery.data?.accountType?.join(", ") || "无账户"}
      </td>
      <td className="border border-gray-300 p-3">
        {accountQuery.data?.member || "未知成员"}
      </td>
      <td className="border border-gray-300 p-3">
        {accountQuery.data?.comment || "无备注"}
      </td>
      <td className="border border-gray-300 p-3">
        {accountQuery.data?.transactionType === 1 ? "收入" : "支出"}
      </td>
      <td className="border border-gray-300 p-3">
        {pda.toString().slice(0, 8)}...
      </td>
      <td className="border border-gray-300 p-3">
        <button
          onClick={() => handleDelete(pda)}
          className="px-3 py-1 bg-orange-400 text-white rounded-md text-xs hover:bg-orange-800 transition-colors"
          disabled={deleteLedgerEntry?.isPending || false}
        >
          {deleteLedgerEntry?.isPending ? "修改中..." : "修改"}
        </button>
      </td>
      <td className="border border-gray-300 p-3">
        <button
          onClick={() => handleDelete(pda)}
          className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-800 transition-colors"
          disabled={deleteLedgerEntry?.isPending || false}
        >
          {deleteLedgerEntry?.isPending ? "删除中..." : "删除"}
        </button>
      </td>
    </tr>
  );
}

const TableHeader = React.memo(() => {
  return (
    <thead>
      <tr className="bg-gray-200 text-gray-700 sticky top-0 z-10">
        <th className="border border-gray-300 p-3 text-left">时间</th>
        <th className="border border-gray-300 p-3 text-left">金额</th>
        <th className="border border-gray-300 p-3 text-left">分类</th>
        <th className="border border-gray-300 p-3 text-left">账户</th>
        <th className="border border-gray-300 p-3 text-left">成员</th>
        <th className="border border-gray-300 p-3 text-left">备注</th>
        <th className="border border-gray-300 p-3 text-left">收支类型</th>
        <th className="border border-gray-300 p-3 text-left">交易哈希</th>
        <th className="border border-gray-300 p-3 text-left">操作</th>
        <th className="border border-gray-300 p-3 text-left"></th>
      </tr>
    </thead>
  );
});

// 定义菜单项及其对应的内容组件
const menuItems = [
  { name: "主页", component: HomeContent },
  { name: "流水", component: KeepingListContent },
  { name: "报表", component: ReportContent },
  { name: "收支明细", component: ReportContent },
  { name: "资产概况", component: ReportContent },
  { name: "账户管理", component: ReportContent },
];

export function KeepingList() {
  const { cluster } = useCluster();
  const { publicKey } = useWallet();
  const { program, getProgramAccount } = useLedgerProgram();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("流水"); // 默认显示“流水”标签

  useEffect(() => {
    const appElement = document.getElementById("__next");
    if (appElement) {
      Modal.setAppElement(appElement);
    } else {
      console.error("Cannot find #__next element for react-modal");
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (!publicKey) {
    return (
      <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
        <span>请连接钱包以查看流水记录</span>
      </div>
    );
  }

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-purple-500"></span>
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
        <span>找不到程序账户。请确保已部署程序并处于正确的集群。</span>
      </div>
    );
  }

  // 渲染右侧内容
  const renderContent = () => {
    const activeItem = menuItems.find((item) => item.name === activeTab);
    if (!activeItem) return <div>请选择一个标签</div>;
    const Component = activeItem.component;
    return <Component setIsModalOpen={setIsModalOpen} />;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* 左侧菜单栏 */}
      <div className="w-56 bg-white shadow-md">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">导航</h2>
        </div>
        <ul className="mt-2">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`px-5 py-3 text-sm ${
                activeTab === item.name
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              } cursor-pointer`}
              onClick={() => setActiveTab(item.name)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 p-8">{renderContent()}</div>

      {/* 模态框 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={true}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 1000,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "hidden",
            padding: "0",
            borderRadius: "10px",
            background: "#fff",
            border: "none",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <div className="sticky top-0 bg-white p-4 border-b z-10">
          <h2 className="text-xl font-semibold mb-0">新增收入/支出</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <LedgerCreate onClose={() => setIsModalOpen(false)} />
        </div>
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end space-x-4">
          {/* <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            取消
          </button>
          <button
            onClick={LedgerCard.handleSubmit}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            保存
          </button> */}
        </div>
      </Modal>
    </div>
  );
}
