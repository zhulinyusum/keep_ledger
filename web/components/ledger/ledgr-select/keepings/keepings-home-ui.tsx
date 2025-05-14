// "use client";
// import React, { useState, useEffect } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { useCluster } from "../../../cluster/cluster-data-access";
// import { useLedgerProgram, useLedgerProgramAccount } from "../new-ledger/ledger-data-access";
// import Modal from "react-modal";
// import { LedgerCreate } from "../new-ledger/ledger-ui";
// import { PublicKey } from "@solana/web3.js";

// // 模拟数据（可替换为实际数据源）
// const mockData = {
//   income: 55345.00,
//   expense: 324.00,
//   balance: 55021.00,
//   chartData: [
//     { date: "05-01", income: 0, expense: 0 },
//     { date: "05-15", income: 50000, expense: 200 },
//     { date: "05-31", income: 5345, expense: 124 },
//   ],
//   currentDate: new Date().toLocaleDateString("zh-CN", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).replace(/\//g, "年").replace(/日$/, "日"),
// };

// // 柱状图组件（简易实现，使用 CSS）
// const Chart = () => {
//   const data = mockData.chartData;

//   return (
//     <div className="w-full h-40 bg-white p-4 rounded-lg shadow-md">
//       <div className="flex justify-between text-xs text-gray-600 mb-2">
//         {data.map((item) => (
//           <span key={item.date}>{item.date}</span>
//         ))}
//       </div>
//       <div className="relative h-24 flex justify-between items-end">
//         {data.map((item, index) => {
//           const maxValue = Math.max(...data.map((d) => d.income + d.expense));
//           const barHeightIncome = (item.income / maxValue) * 100;
//           const barHeightExpense = (item.expense / maxValue) * 100;

//           return (
//             <div key={index} className="flex flex-col items-center w-1/5">
//               <div
//                 className="w-4 bg-orange-500 rounded-t"
//                 style={{ height: `${barHeightIncome}%` }}
//               ></div>
//               <div
//                 className="w-4 bg-gray-300 rounded-t mt-1"
//                 style={{ height: `${barHeightExpense}%` }}
//               ></div>
//             </div>
//           );
//         })}
//       </div>
//       <div className="text-center text-xs text-gray-500 mt-2">本月收支</div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, progress = 0 }: { title: string; value: number; progress?: number }) => (
//   <div className="bg-white p-4 rounded-lg shadow-md mb-2">
//     <div className="text-xs text-gray-600">{title}</div>
//     <div className="text-lg font-semibold text-orange-600">{value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
//     {progress > 0 && (
//       <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//         <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
//       </div>
//     )}
//     {progress > 0 && <div className="text-xs text-gray-500 mt-1">{progress}%</div>}
//   </div>
// );

// export function HomeContent({ setIsModalOpen }: { setIsModalOpen: (value: boolean) => void }): React.ReactNode {
//   const { publicKey } = useWallet();
//   const { cluster } = useCluster();
//   const { accounts } = useLedgerProgram();

//   const [income, setIncome] = useState(mockData.income);
//   const [expense, setExpense] = useState(mockData.expense);
//   const [balance, setBalance] = useState(mockData.balance);
//   const [currentDate, setCurrentDate] = useState(mockData.currentDate);

//   useEffect(() => {
//     // 从 accounts 数据计算收入、支出和余额
//     if (accounts.data) {
//       const calculatedIncome = accounts.data
//         .filter((entry: any) => entry.account.transactionType === 1)
//         .reduce((sum: number, entry: any) => sum + (entry.account.amount?.toNumber() || 0), 0);
//       const calculatedExpense = accounts.data
//         .filter((entry: any) => entry.account.transactionType === 2)
//         .reduce((sum: number, entry: any) => sum + (entry.account.amount?.toNumber() || 0), 0);
//       setIncome(calculatedIncome);
//       setExpense(calculatedExpense);
//       setBalance(calculatedIncome - calculatedExpense);
//     }
//   }, [accounts.data]);

//   return (
//     <div className="p-8"> {/* 改为与 KeepingListContent 相同的 p-8 内边距 */}
//       {/* 顶部区域 */}
//       <div className="relative w-full h-48 bg-cover bg-center rounded-lg mb-6" style={{ backgroundImage: "url('https://via.placeholder.com/600x200?text=Family+at+Beach')" }}>
//         <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
//           <div>{currentDate}</div>
//           <div className="flex space-x-4">
//             <span>收入: {income.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
//             <span>支出: {expense.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
//           </div>
//         </div>
//       </div>

//       {/* 中间区域 - 柱状图 */}
//       <Chart />

//       {/* 右侧区域 - 统计卡片 */}
//       <div className="grid grid-cols-2 gap-4 mt-6"> {/* 调整间距与 KeepingListContent 一致 */}
//         <StatCard title="本月收入" value={income} progress={100} />
//         <StatCard title="本月支出" value={expense} />
//         <StatCard title="本月结余" value={balance} />
//       </div>

//       {/* 底部区域 - 其他统计 */}
//       <div className="mt-6 bg-white p-4 rounded-lg shadow-md"> {/* 调整间距与 KeepingListContent 一致 */}
//         <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
//           <div>本月收入: 0.00</div>
//           <div>本月支出: 0.00</div>
//           <div>收入占比: 0.00</div>
//           <div>支出占比: 0.00</div>
//         </div>
//         <button className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
//           查看详情
//         </button>
//       </div>
//     </div>
//   );
// };

"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCluster } from "../../../cluster/cluster-data-access";
import { calculateTotals } from "./keepings-ui";
import {
  useLedgerProgram,
  useLedgerProgramAccount,
} from "../new-ledger/ledger-data-access";
import Modal from "react-modal";
import { LedgerCreate } from "../new-ledger/ledger-ui";
import { PublicKey } from "@solana/web3.js";

// 模拟数据（可替换为实际数据源）
// {accounts.data?.map((pda,index) => (
//   <>

//   <div
//     key={pda.account.keepingTime}
//     className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
//   >
//     <div className="flex items-center space-x-3">
//       <div
//         className={`w-8 h-8 rounded-full flex items-center justify-center ${
//           pda.account.transactionType  === 0
//             ? "bg-red-100 text-red-500"
//             : "bg-green-100 text-green-500"
//         }`}
//       >
//         {pda.account.transactionType === 0 ? "出" : "入"}
//       </div>
//       <div>
//         <div className="text-sm font-medium">交易{index+1}</div>
//         <div className="text-xs text-gray-500">
//           {formatTimestamp(pda.account.keepingTime)}
//         </div>
//       </div>
//     </div>
//     <div
//       className={`font-medium ${
//         pda.account.transactionType === 0 ? "text-red-500" : "text-green-500"
//       }`}
//     >
//       {pda.account.transactionType === 0 ? "-" : "+"}¥{(pda.account.amount.toString()).toLocaleString()}
//     </div>
//   </div>
//   </>
// ))}
// 
const mockData = {
  income: 55345.0,
  expense: 324.0,
  balance: 55021.0,
  chartData: [
    { date: "05-01", income: 0, expense: 0 },
    { date: "05-15", income: 50000, expense: 200 },
    { date: "05-31", income: 5345, expense: 124 },
  ],
  currentDate: new Date()
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "年")
    .replace(/日$/, "日"),
};

// 优化后的柱状图组件
const Chart = ({ data }: { data: typeof mockData.chartData }) => {
  const maxValue =
    Math.max(...data.map((d) => Math.max(d.income, d.expense))) * 1.2;

  return (
    <div className="w-full h-64 bg-white p-4 rounded-lg shadow-md border border-gray-100">
      <div className="flex justify-between text-xs text-gray-500 mb-2 px-2">
        {data.map((item) => (
          <span key={item.date}>{item.date}</span>
        ))}
      </div>
      <div className="relative h-40 flex items-end justify-between">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-1/5 h-full">
            <div className="flex flex-col justify-end h-full w-full">
              <div className="flex items-end space-x-1 h-full">
                <div
                  className="w-3 bg-green-400 rounded-t-md transition-all duration-300"
                  style={{ height: `${(item.income / maxValue) * 100}%` }}
                  title={`收入: ¥${item.income.toLocaleString()}`}
                ></div>
                <div
                  className="w-3 bg-red-400 rounded-t-md transition-all duration-300"
                  style={{ height: `${(item.expense / maxValue) * 100}%` }}
                  title={`支出: ¥${item.expense.toLocaleString()}`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 mr-1 rounded-sm"></div>
          <span className="text-xs text-gray-600">收入</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-400 mr-1 rounded-sm"></div>
          <span className="text-xs text-gray-600">支出</span>
        </div>
      </div>
    </div>
  );
};

// 优化后的统计卡片
const StatCard = ({
  title,
  value,
  type = "default",
  change,
}: {
  title: string;
  value: number;
  type?: "income" | "expense" | "default";
  change?: number;
}) => {
  const colors = {
    income: "text-green-600",
    expense: "text-red-600",
    default: "text-gray-800",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex flex-col">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className={`text-xl font-semibold ${colors[type]}`}>
        ¥
        {value.toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      {change !== undefined && (
        <div
          className={`text-xs mt-1 ${
            change >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
};

export function HomeContent({
  setIsModalOpen,
}: {
  setIsModalOpen: (value: boolean) => void;
}) {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const { accounts } = useLedgerProgram();

  const [income, setIncome] = useState(mockData.income);
  const [expense, setExpense] = useState(mockData.expense);
  const [balance, setBalance] = useState(mockData.balance);
  const [currentDate, setCurrentDate] = useState(mockData.currentDate);

  useEffect(() => {
    if (accounts.data) {
      const { totalIncome, totalExpense } = calculateTotals(accounts);
      setIncome(totalIncome);
      setExpense(totalExpense);
      setBalance(totalIncome - totalExpense);
      console.log("accounts.data", accounts.data);
      console.log("accounts", accounts);
      console.log("totalExpense.data", totalExpense);
      console.log("totalIncome.data", totalIncome);
      console.log("Balance.data", totalIncome - totalExpense);

      // const calculatedIncome = accounts.data
      //   .filter((entry: any) => entry.account.transactionType === 1)
      //   .reduce((sum: number, entry: any) => sum + (entry.account.amount?.toNumber() || 0), 0);
      // const calculatedExpense = accounts.data
      //   .filter((entry: any) => entry.account.transactionType === 2)
      //   .reduce((sum: number, entry: any) => sum + (entry.account.amount?.toNumber() || 0), 0);
      // setIncome(calculatedIncome);
      // setExpense(calculatedExpense);
      // setBalance(calculatedIncome - calculatedExpense);
    }
  }, [accounts.data]);

  // 计算月度变化
  const monthlyChange = {
    income: 12.5, // 示例数据，应从实际数据计算
    expense: -3.2,
    balance: 8.7,
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="w-full p-4 md:p-6 max-w-full mx-auto">
      {/* 顶部横幅 */}
      <div className="relative w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6 overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">家庭财务概览</h1>
          <div className="text-sm opacity-90">{currentDate}</div>
          <div className="flex space-x-6 mt-2">
            <div>
              <div className="text-xs opacity-80">总收入</div>
              <div className="text-lg font-medium">
                ¥{income.toLocaleString("zh-CN")}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-80">总支出</div>
              <div className="text-lg font-medium">
                ¥{expense.toLocaleString("zh-CN")}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-80">净余额</div>
              <div className="text-lg font-medium">
                ¥{balance.toLocaleString("zh-CN")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 统计卡片 */}
        <div className="space-y-4">
          <StatCard
            title="本月收入"
            value={income}
            type="income"
            change={monthlyChange.income}
          />
          <StatCard
            title="本月支出"
            value={expense}
            type="expense"
            change={monthlyChange.expense}
          />
          <StatCard
            title="当前余额"
            value={balance}
            change={monthlyChange.balance}
          />

          {/* 快速操作区 */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">快速操作</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                新增记录
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                查看报表
              </button>
            </div>
          </div>
        </div>

        {/* 中间 - 图表区 */}
        <div className="lg:col-span-2">
          <Chart data={mockData.chartData} />

          {/* 最近交易 */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">最近交易</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {accounts.data?.map((pda, index) => (
                <>
                  <div
                    key={pda.account.keepingTime}
                    className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          pda.account.transactionType === 0
                            ? "bg-red-100 text-red-500"
                            : "bg-green-100 text-green-500"
                        }`}
                      >
                        {pda.account.transactionType === 0 ? "出" : "入"}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          交易{index + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimestamp(pda.account.keepingTime)}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-medium ${
                        pda.account.transactionType === 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {pda.account.transactionType === 0 ? "-" : "+"}¥
                      {pda.account.amount.toString().toLocaleString()}
                    </div>
                  </div>
                </>
              ))}
              {/* {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item % 2 === 0
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      {item % 2 === 0 ? "出" : "入"}
                    </div>
                    <div>
                      <div className="text-sm font-medium">交易{item}</div>
                      <div className="text-xs text-gray-500">
                        2023-05-{10 + item}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${
                      item % 2 === 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {item % 2 === 0 ? "-" : "+"}¥{(item * 523).toLocaleString()}
                  </div>
                </div>
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
