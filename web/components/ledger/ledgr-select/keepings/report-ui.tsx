"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCluster } from "../../../cluster/cluster-data-access";
import { useLedgerProgram } from "../new-ledger/ledger-data-access";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// 注册 Chart.js 组件
ChartJS.register(ArcElement, Tooltip, Legend);

export function ReportContent() {
  const { cluster } = useCluster();
  const { publicKey } = useWallet();
  const { program, accounts, getProgramAccount } = useLedgerProgram();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>("");

  const categories = ["餐饮", "交通", "购物", "娱乐", "医疗", "教育"];
  const accountTypes = ["现金", "支付宝", "微信钱包", "银行卡", "信用卡"];
  const transactionTypes = ["", "收入", "支出"];

  // 统计数据（包括图表数据）
  const calculateSummary = () => {
    if (!accounts.data) {
      return { summary: [], totalIncome: 0, totalExpense: 0, incomeByCategory: {}, expenseByCategory: {} };
    }

    const summaryMap: {
      [key: string]: { category: string; accountType: string; income: number; expense: number };
    } = {};
    const incomeByCategory: { [key: string]: number } = {};
    const expenseByCategory: { [key: string]: number } = {};

    let totalIncome = 0;
    let totalExpense = 0;

    const filteredData = accounts.data.filter((entry: any) => {
      const keepingTime = entry.account.keepingTime?.toNumber() * 1000;
      const category = entry.account.category?.[0] || "";
      const accountType = entry.account.accountType?.[0] || "";
      const amount = entry.account.amount?.toNumber() || 0;
      const transactionType = amount < 0 ? "支出" : "收入";

      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      const isInDateRange = keepingTime >= start && keepingTime <= end;

      const matchesCategory = selectedCategory ? category === selectedCategory : true;
      const matchesAccountType = selectedAccountType ? accountType === selectedAccountType : true;
      const matchesTransactionType = selectedTransactionType
        ? transactionType === selectedTransactionType
        : true;

      return isInDateRange && matchesCategory && matchesAccountType && matchesTransactionType;
    });

    filteredData.forEach((entry: any) => {
      const category = entry.account.category?.[0] || "未分类";
      const accountType = entry.account.accountType?.[0] || "未指定";
      const amount = entry.account.amount?.toNumber() || 0;
      const isExpense = amount < 0;

      // 按分类统计收入和支出（用于图表）
      if (isExpense) {
        expenseByCategory[category] = (expenseByCategory[category] || 0) + Math.abs(amount);
        totalExpense += Math.abs(amount);
      } else {
        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
        totalIncome += amount;
      }

      // 按分类和账户类型统计（用于表格）
      const key = `${category}-${accountType}`;
      if (!summaryMap[key]) {
        summaryMap[key] = { category, accountType, income: 0, expense: 0 };
      }
      if (isExpense) {
        summaryMap[key].expense += Math.abs(amount);
      } else {
        summaryMap[key].income += amount;
      }
    });

    const summary = Object.values(summaryMap);
    return { summary, totalIncome, totalExpense, incomeByCategory, expenseByCategory };
  };

  const { summary, totalIncome, totalExpense, incomeByCategory, expenseByCategory } = calculateSummary();

  // 图表数据
  const incomeChartData = {
    labels: Object.keys(incomeByCategory),
    datasets: [
      {
        label: "收入分布",
        data: Object.values(incomeByCategory),
        backgroundColor: [
          "#F97316", // 橙色 (text-orange-600)
          "#FB923C",
          "#FDBA74",
          "#FECACA",
          "#FED7AA",
          "#FFF7ED",
        ],
        borderWidth: 1,
      },
    ],
  };

  const expenseChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        label: "支出分布",
        data: Object.values(expenseByCategory),
        backgroundColor: [
          "#F97316", // 橙色
          "#FB923C",
          "#FDBA74",
          "#FECACA",
          "#FED7AA",
          "#FFF7ED",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedCategory("");
    setSelectedAccountType("");
    setSelectedTransactionType("");
  };

  if (!publicKey) {
    return (
      <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
        <span>请连接钱包以查看报表</span>
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
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* 侧边栏 */}
      {/* <div className="w-56 bg-white shadow-md">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">导航</h2>
        </div>
        <ul className="mt-2">
          {["主页", "流水", "账本", "收支明细", "资产概况", "账户管理", "报表"].map(
            (item, index) => (
              <li
                key={index}
                className={`px-5 py-3 text-sm ${
                  item === "报表"
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <a href="#" className="block">
                  {item}
                </a>
              </li>
            )
          )}
        </ul>
      </div> */}

      {/* 主内容区域 */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-orange-600">报表</h1>
            <div className="text-sm text-gray-600 mt-1">
              总收入:{" "}
              <span className="text-orange-600">{formatAmount(totalIncome)}</span> | 总支出:{" "}
              <span className="text-orange-600">{formatAmount(totalExpense)}</span> | 净额:{" "}
              <span className="text-orange-600">
                {formatAmount(totalIncome - totalExpense)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <img
              src="/avatar.png"
              alt=" "
              // alt="用户"
              className="w-8 h-8 rounded-full border border-gray-200"
            />
          </div>
        </div>

        {/* 筛选控件 */}
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
                placeholder="开始日期"
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
                placeholder="结束日期"
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
                {transactionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type || "全部"}
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

        {/* 图表区域 */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">收支分布</h3>
          <div className="flex flex-col md:flex-row gap-4">
            {/* 收入分布图 */}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-600 mb-2">按分类收入分布</h4>
              <div className="h-64">
                {Object.keys(incomeByCategory).length > 0 ? (
                  <Pie data={incomeChartData} options={chartOptions} />
                ) : (
                  <p className="text-gray-500 text-center">暂无收入数据</p>
                )}
              </div>
            </div>
            {/* 支出分布图 */}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-600 mb-2">按分类支出分布</h4>
              <div className="h-64">
                {Object.keys(expenseByCategory).length > 0 ? (
                  <Pie data={expenseChartData} options={chartOptions} />
                ) : (
                  <p className="text-gray-500 text-center">暂无支出数据</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 报表表格 */}
        <div className="space-y-8 py-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-700 sticky top-0 z-10">
                  <th className="border border-gray-300 p-3 text-left">分类</th>
                  <th className="border border-gray-300 p-3 text-left">账户类型</th>
                  <th className="border border-gray-300 p-3 text-left">收入</th>
                  <th className="border border-gray-300 p-3 text-left">支出</th>
                  <th className="border border-gray-300 p-3 text-left">净额</th>
                </tr>
              </thead>
              <tbody>
                {summary.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-gray-300 p-3 text-center text-gray-500"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  summary.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 p-3">{item.category}</td>
                      <td className="border border-gray-300 p-3">{item.accountType}</td>
                      <td className="border border-gray-300 p-3 text-green-600">
                        {formatAmount(item.income)}
                      </td>
                      <td className="border border-gray-300 p-3 text-red-600">
                        {formatAmount(item.expense)}
                      </td>
                      <td
                        className={`border border-gray-300 p-3 ${
                          item.income - item.expense >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatAmount(item.income - item.expense)}
                      </td>
                    </tr>
                  ))
                )}
                {/* 汇总行 */}
                {summary.length > 0 && (
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 p-3">总计</td>
                    <td className="border border-gray-300 p-3">-</td>
                    <td className="border border-gray-300 p-3 text-green-600">
                      {formatAmount(totalIncome)}
                    </td>
                    <td className="border border-gray-300 p-3 text-red-600">
                      {formatAmount(totalExpense)}
                    </td>
                    <td
                      className={`border border-gray-300 p-3 ${
                        totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatAmount(totalIncome - totalExpense)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}