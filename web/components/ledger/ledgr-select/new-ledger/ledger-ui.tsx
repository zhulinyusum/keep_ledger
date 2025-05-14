"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { ellipsify } from "../../../ui/ui-layout";
import { ExplorerLink } from "../../../cluster/cluster-ui";
import {
  useLedgerProgram,
  useLedgerProgramAccount,
} from "./ledger-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { BN } from "@coral-xyz/anchor";
import { useMutationState } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // App Router

export default function TestComponent() {
  return (
    <button onClick={() => console.log("最小测试日志 -", Date.now())}>
      点击测试 Console 
    </button>
  );
}

export function LedgerCreate({ onClose }: { onClose: () => void }) {
  // 添加 onClose props
  const { createLedgerEntry } = useLedgerProgram();
  const [transaction_type, setTransactionType] = useState(0);
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState<string>("0");
  const [category, setCategory] = useState<string[]>([""]);
  const [account_type, setAccountType] = useState<string[]>([""]);
  const [member, setMember] = useState("所有 / 156****2800");
  const [merchant, setMerchant] = useState("");
  const [project, setProject] = useState("");
  const [comment, setComment] = useState("");
  const [img, setImg] = useState("");

  // 模拟数据
  const categories = ["餐饮", "交通", "购物", "娱乐", "医疗", "教育"];
  const accountTypes = ["现金", "支付宝", "微信钱包", "银行卡", "信用卡"];
  const members = ["朋友", "本人", "老公","子女", "父母","老婆"];
  const merchants = ["超市", "餐厅", "网购平台", "加油站", "电影院"];
  const projects = ["家庭日常", "个人消费", "旅行", "投资", "还款"];

  // 表单验证：确保金额为有效数字，且分类和账户类型已选择
  const isFormValid =
    Number(amount) > 0 && category[0] !== "" && account_type[0] !== "";

  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("请填写所有必填字段（金额、分类、账户）");
      return;
    }
    if (!publicKey) {
      toast.error("请连接钱包");
      return;
    }

    const keeping_num = new BN(Date.now());
    const amount_BN = new BN(Number(amount));
    const keeping_time_BN = new BN(Math.floor(Date.now() / 1000));
    try {
      await createLedgerEntry.mutateAsync({
        // pda: publicKey,
        keeping_num: keeping_num,
        transaction_type: transaction_type,
        amount: amount_BN,
        category,
        account_type,
        member,
        merchant,
        project,
        comment,
        img,
      });
      setIsSuccess(true);
      toast.success("记录保存成功");
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败，请查看控制台");
      setIsSuccess(false);
    }
  };

  // 成功时自动跳转并关闭模态框
  useEffect(() => {
    if (isSuccess) {
      router.push("/ledger/ledger-select/keepings");
      if (onClose) onClose(); // 关闭模态框
    }
  }, [isSuccess, router, onClose]);

  if (!publicKey) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">请连接钱包以开始记账</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl bg-white rounded-lg p-6 shadow-sm">
      <Head>
        <title>记账</title>
        <meta name="description" content="多功能记账应用" />
      </Head>

      {/* 交易类型选择 */}
      <div className="flex justify-around bg-gray-100 rounded-lg p-2 mb-6">
        {["支出", "收入"].map((type) => (
          <button
            key={type}
            className={`btn btn-sm ${
              transaction_type === (type === "收入" ? 1 : 0)
                ? "btn-primary"
                : "btn-ghost"
            }`}
            onClick={() => {
              if (type === "收入") {
                setTransactionType(1);
              } else {
                setTransactionType(0);
              }
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 记账表单 */}
      <div className="space-y-4">
        {/* 金额 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">金额*</span>
          </label>
          <input
            type="number"
            placeholder="输入金额"
            className="input input-bordered w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* 分类 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">分类*</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={category[0]}
            onChange={(e) => setCategory([e.target.value])}
          >
            <option value="">请选择</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 账户 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">账户*</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={account_type[0]}
            onChange={(e) => setAccountType([e.target.value])}
          >
            <option value="">请选择</option>
            {accountTypes.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        {/* 记账时间 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">记账时间</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={new Date().toLocaleString()}
            readOnly
          />
        </div>

        {/* 成员 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">成员*</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={member}
            onChange={(e) => setMember(e.target.value)}
          >
            <option value="">请选择</option>
            {members.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* 商家 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">商家</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          >
            <option value="">请选择</option>
            {merchants.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* 项目 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">项目</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">请选择</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 备注 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">备注</span>
            <span className="label-text-alt">{comment.length}/50</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="请输入备注"
            rows={3}
            maxLength={50}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        {/* 图片上传 */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold">图片（最多9张）</span>
          </label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-gray-500">上传高清原图</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          <button
            className={`btn px-8 ${
              createLedgerEntry.isPending || !isFormValid
                ? "btn-disabled"
                : "btn-primary hover:bg-stone-900"
            } transition-transform hover:-translate-y-1`}
            onClick={handleSubmit}
            disabled={createLedgerEntry.isPending || !isFormValid}
          >
            {createLedgerEntry.isPending ? (
              <span className="flex items-center justify-center">
                <span className="loading loading-spinner mr-2"></span>
                保存中...
              </span>
            ) : (
              "保存"
            )}
          </button>
          <button
            className="btn btn-outline px-8"
            onClick={onClose} // 取消时关闭模态框
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

// 以下部分（LedgerList 和 LedgerCard）保持不变
export function LedgerList() {
  const { accounts, getProgramAccount } = useLedgerProgram();

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
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      {accounts.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-purple-500"></span>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.data?.map((pda: { publicKey: PublicKey }) => (
            <>
              <LedgerCard key={pda.publicKey.toString()} pda={pda.publicKey} />
              <h2>JJJJJJJrtJJJJJJJJJJJJJJJJJLLLLLLLLLLLLLLL</h2>
            </>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-4">暂无记录</h2>
          <p className="text-gray-500">创建你的第一条账本记录以开始</p>
        </div>
      )}
    </div>
  );
}

export function LedgerCard({ pda }: { pda: PublicKey }) {
  const { accountQuery, updateLedgerEntry, deleteLedgerEntry } =
    useLedgerProgramAccount({
      pda,
    });
  const title = accountQuery.data?.title;
  console.log("accountQueitle", accountQuery);

  const { createLedgerEntry } = useLedgerProgram();
  const [transaction_type, setTransactionType] = useState("");
  const { publicKey } = useWallet();
  const [keeping_num, setKeeping_num] = useState(1);
  const [amount, setAmount] = useState<string>("0");
  const [category, setCategory] = useState<string[]>([]);
  const [account_type, setAccountType] = useState<string[]>([]);
  const [keeping_time, setKeeping_time] = useState(1);
  const [member, setMember] = useState("所有 / 156****2800");
  const [merchant, setMerchant] = useState("");
  const [project, setProject] = useState("");
  const [comment, setComment] = useState("");
  const [img, setImg] = useState("");

  const isFormValid = keeping_num > 0;

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateLedgerEntry.mutateAsync({
        pda: publicKey,
        keeping_num,
        transaction_type,
        amount,
        category,
        account_type,
        member,
        merchant,
        project,
        comment,
        img,
      });
    }
  };

  if (!publicKey) {
    return (
      <p className="text-center p-4 text-gray-500">请连接钱包以查看记录</p>
    );
  }

  return accountQuery.isLoading ? (
    <div className="flex justify-center items-center h-48">
      <span className="loading loading-spinner loading-lg text-purple-500"></span>
    </div>
  ) : (
    <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 rounded-xl overflow-hidden">
      <div className="card-body p-6">
        <div className="space-y-4">
          <h2
            className="card-title text-2xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>

          <p className="text-gray-600 min-h-16">{accountQuery.data?.message}</p>

          <div className="card-actions flex-col">
            <textarea
              placeholder="更新金额"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="textarea textarea-bordered w-full mb-3 focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              className={`btn btn-block ${
                updateLedgerEntry.isPending ? "btn-disabled" : "btn-primary"
              } mb-3 transition-transform hover:-translate-y-0.5`}
              onClick={handleSubmit}
              disabled={updateLedgerEntry.isPending || !isFormValid}
            >
              {updateLedgerEntry.isPending ? (
                <span className="flex items-center justify-center">
                  <span className="loading loading-spinner mr-2"></span>
                  更新中...
                </span>
              ) : (
                "更新账本条目"
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <div className="text-sm text-gray-500">
              <ExplorerLink
                path={`account/${pda}`}
                label={ellipsify(pda.toString())}
                className="hover:text-purple-600 transition-colors"
              />
            </div>
            <button
              className="btn btn-sm btn-outline btn-error transition-transform hover:-translate-y-0.5"
              onClick={() => {
                if (!window.confirm("确定要删除此条目吗？")) {
                  return;
                }
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteLedgerEntry.mutateAsync(title);
                }
              }}
              disabled={deleteLedgerEntry.isPending}
            >
              {deleteLedgerEntry.isPending ? (
                <span className="flex items-center justify-center">
                  <span className="loading loading-spinner mr-2"></span>
                  删除中...
                </span>
              ) : (
                "删除条目"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { Keypair, PublicKey } from "@solana/web3.js";
// import { ellipsify } from "../../../ui/ui-layout";
// import { ExplorerLink } from "../../../cluster/cluster-ui";
// import {
//   CreateLedgerEntryArgs,
//   useLedgerProgram,
//   useLedgerProgramAccount,
// } from "./ledger-data-access";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Head from "next/head";
// import { BN } from "@coral-xyz/anchor";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// export default function TestComponent() {
//   return (
//     <button onClick={() => console.log("最小测试日志 -", Date.now())}>
//       点击测试 Console
//     </button>
//   );
// }

// interface LedgerEntryArgs {
//   keeping_num: BN;
//   transaction_type: number;
//   amount: BN;
//   category: string[];
//   account_type: string[];
//   member: string;
//   merchant: string;
//   project: string;
//   comment: string;
//   img: string;
// }

// interface SubmitLedgerParams {
//   publicKey: PublicKey | null;
//   // createLedgerEntry: UseMutationResult<void, unknown, LedgerEntryArgs, unknown>;
//   amount: string;
//   category: string[];
//   account_type: string[];
//   transaction_type: number;
//   member: string;
//   merchant: string;
//   project: string;
//   comment: string;
//   img: string;
//   setIsSuccess: (value: boolean) => void;
// }

// export function submitLedgerEntry = async ({
//   // createLedgerEntry,
//   amount,
//   category,
//   account_type,
//   transaction_type,
//   member,
//   merchant,
//   project,
//   comment,
//   img,
// }: CreateLedgerEntryArgs) => {
//   const { createLedgerEntry } = useLedgerProgram();
//   // 表单验证
//   const isFormValid =
//     Number(amount) > 0 && category[0] !== "" && account_type[0] !== "";
//   if (!isFormValid) {
//     toast.error("请填写所有必填字段（金额、分类、账户）");
//     return;
//   }


//   const keeping_num = new BN(Date.now());
//   const amount_BN = new BN(Number(amount));
//   const keeping_time_BN = new BN(Math.floor(Date.now() / 1000));

//   await createLedgerEntry.mutateAsync({
//     keeping_num: keeping_num,
//     transaction_type: transaction_type,
//     amount: amount_BN,
//     category,
//     account_type,
//     member,
//     merchant,
//     project,
//     comment,
//     img,
//   });
// };

// export function LedgerCreate({ onClose }: { onClose: () => void }) {
//   const [isSuccess, setIsSuccess] = useState(false);
//   const { publicKey } = useWallet();
//   const { createLedgerEntry } = useLedgerProgram();
//   const [keeping_num, setKeepingNum] = useState(0);
//   const [transaction_type, setTransactionType] = useState(0);

//   const [amount, setAmount] = useState<string>("0");
//   const [category, setCategory] = useState<string[]>([""]);
//   const [account_type, setAccountType] = useState<string[]>([""]);
//   const [member, setMember] = useState("所有 / 156****2800");
//   const [merchant, setMerchant] = useState("");
//   const [project, setProject] = useState("");
//   const [comment, setComment] = useState("");
//   const [img, setImg] = useState("");
//   // const [isSuccess, setIsSuccess] = useState(false);
//   const router = useRouter();

//   const categories = ["餐饮", "交通", "购物", "娱乐", "医疗", "教育"];
//   const accountTypes = ["现金", "支付宝", "微信钱包", "银行卡", "信用卡"];
//   const members = ["朋友", "本人", "老公", "子女", "父母", "老婆"];
//   const merchants = ["超市", "餐厅", "网购平台", "加油站", "电影院"];
//   const projects = ["家庭日常", "个人消费", "旅行", "投资", "还款"];

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await submitLedgerEntry({
//         keeping_num,
//         transaction_type,
//         amount,
//         category,
//         account_type,
//         member,
//         merchant,
//         project,
//         comment,
//         img,
//       });
//       setIsSuccess(true);
//       toast.success("记录保存成功");
//     } catch (error) {
//       console.error("保存失败:", error);
//       toast.error("保存失败，请查看控制台");
//       setIsSuccess(false);
//     }
//   };

//   useEffect(() => {
//     if (isSuccess) {
//       router.push("/ledger/ledger-select/keepings");
//       if (onClose) onClose();
//     }
//   }, [isSuccess, router, onClose]);

//   if (!publicKey) {
//     return (
//       <div className="text-center p-8">
//         <p className="text-lg text-gray-500">请连接钱包以开始记账</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg p-6">
//       <Head>
//         <title>记账</title>
//         <meta name="description" content="多功能记账应用" />
//       </Head>

//       <div className="flex justify-around bg-gray-100 rounded-lg p-2 mb-6">
//         {["支出", "收入"].map((type) => (
//           <button
//             key={type}
//             className={`btn btn-sm ${
//               transaction_type === (type === "收入" ? 1 : 0)
//                 ? "btn-primary"
//                 : "btn-ghost"
//             }`}
//             onClick={() => {
//               if (type === "收入") {
//                 setTransactionType(1);
//               } else {
//                 setTransactionType(0);
//               }
//             }}
//           >
//             {type}
//           </button>
//         ))}
//       </div>

//       <div className="space-y-4">
//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">金额*</span>
//           </label>
//           <input
//             type="number"
//             placeholder="输入金额"
//             className="input input-bordered w-full"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//           />
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">分类*</span>
//           </label>
//           <select
//             className="select select-bordered w-full"
//             value={category[0]}
//             onChange={(e) => setCategory([e.target.value])}
//           >
//             <option value="">请选择</option>
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">账户*</span>
//           </label>
//           <select
//             className="select select-bordered w-full"
//             value={account_type[0]}
//             onChange={(e) => setAccountType([e.target.value])}
//           >
//             <option value="">请选择</option>
//             {accountTypes.map((acc) => (
//               <option key={acc} value={acc}>
//                 {acc}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">记账时间</span>
//           </label>
//           <input
//             type="text"
//             className="input input-bordered w-full"
//             value={new Date().toLocaleString()}
//             readOnly
//           />
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">成员*</span>
//           </label>
//           <select
//             className="select select-bordered w-full"
//             value={member}
//             onChange={(e) => setMember(e.target.value)}
//           >
//             <option value="">请选择</option>
//             {members.map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">商家</span>
//           </label>
//           <select
//             className="select select-bordered w-full"
//             value={merchant}
//             onChange={(e) => setMerchant(e.target.value)}
//           >
//             <option value="">请选择</option>
//             {merchants.map((m) => (
//               <option key={m} value={m}>
//                 {m}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">项目</span>
//           </label>
//           <select
//             className="select select-bordered w-full"
//             value={project}
//             onChange={(e) => setProject(e.target.value)}
//           >
//             <option value="">请选择</option>
//             {projects.map((p) => (
//               <option key={p} value={p}>
//                 {p}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">备注</span>
//             <span className="label-text-alt">{comment.length}/50</span>
//           </label>
//           <textarea
//             className="textarea textarea-bordered w-full"
//             placeholder="请输入备注"
//             rows={3}
//             maxLength={50}
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//           ></textarea>
//         </div>

//         <div className="form-control">
//           <label className="label">
//             <span className="label-text font-bold">图片（最多9张）</span>
//           </label>
//           <div className="border-2 border-dashed rounded-lg p-8 text-center">
//             <p className="text-gray-500">上传高清原图</p>
//           </div>
//         </div>

//         <div className="flex justify-center space-x-4">
//           <button
//             className={`btn px-8 ${
//               createLedgerEntry.isPending
//                 ? "btn-disabled"
//                 : "btn-primary hover:bg-stone-900"
//             } transition-transform hover:-translate-y-1`}
//             onClick={handleSubmit}
//             disabled={createLedgerEntry.isPending}
//           >
//             {createLedgerEntry.isPending ? (
//               <span className="flex items-center justify-center">
//                 <span className="loading loading-spinner mr-2"></span>
//                 保存中...
//               </span>
//             ) : (
//               "保存"
//             )}
//           </button>
//           <button className="btn btn-outline px-8" onClick={onClose}>
//             取消
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // 以下部分（LedgerList 和 LedgerCard）保持不变
// export function LedgerList() {
//   const { accounts, getProgramAccount } = useLedgerProgram();

//   if (getProgramAccount.isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg text-purple-500"></span>
//       </div>
//     );
//   }

//   if (!getProgramAccount.data?.value) {
//     return (
//       <div className="flex justify-center alert alert-info max-w-2xl mx-auto">
//         <span>找不到程序账户。请确保已部署程序并处于正确的集群。</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 py-6">
//       {accounts.isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <span className="loading loading-spinner loading-lg text-purple-500"></span>
//         </div>
//       ) : accounts.data?.length ? (
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {accounts.data?.map((pda: { publicKey: PublicKey }) => (
//             <>
//               <LedgerCard key={pda.publicKey.toString()} pda={pda.publicKey} />
//               <h2>JJJJJJJrtJJJJJJJJJJJJJJJJJLLLLLLLLLLLLLLL</h2>
//             </>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-12">
//           <h2 className="text-3xl font-bold text-gray-700 mb-4">暂无记录</h2>
//           <p className="text-gray-500">创建你的第一条账本记录以开始</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export function LedgerCard({ pda }: { pda: PublicKey }) {
//   const { accountQuery, updateLedgerEntry, deleteLedgerEntry } =
//     useLedgerProgramAccount({
//       pda,
//     });
//   const title = accountQuery.data?.title;
//   console.log("accountQueitle", accountQuery);

//   const { createLedgerEntry } = useLedgerProgram();
//   const [transaction_type, setTransactionType] = useState("");
//   const { publicKey } = useWallet();
//   const [keeping_num, setKeeping_num] = useState(1);
//   const [amount, setAmount] = useState<string>("0");
//   const [category, setCategory] = useState<string[]>([]);
//   const [account_type, setAccountType] = useState<string[]>([]);
//   const [keeping_time, setKeeping_time] = useState(1);
//   const [member, setMember] = useState("所有 / 156****2800");
//   const [merchant, setMerchant] = useState("");
//   const [project, setProject] = useState("");
//   const [comment, setComment] = useState("");
//   const [img, setImg] = useState("");

//   const isFormValid = keeping_num > 0;

//   const handleSubmit = () => {
//     if (publicKey && isFormValid && title) {
//       updateLedgerEntry.mutateAsync({
//         pda: publicKey,
//         keeping_num,
//         transaction_type,
//         amount,
//         category,
//         account_type,
//         member,
//         merchant,
//         project,
//         comment,
//         img,
//       });
//     }
//   };

//   if (!publicKey) {
//     return (
//       <p className="text-center p-4 text-gray-500">请连接钱包以查看记录</p>
//     );
//   }

//   return accountQuery.isLoading ? (
//     <div className="flex justify-center items-center h-48">
//       <span className="loading loading-spinner loading-lg text-purple-500"></span>
//     </div>
//   ) : (
//     <div className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 rounded-xl overflow-hidden">
//       <div className="card-body p-6">
//         <div className="space-y-4">
//           <h2
//             className="card-title text-2xl font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition-colors"
//             onClick={() => accountQuery.refetch()}
//           >
//             {accountQuery.data?.title}
//           </h2>

//           <p className="text-gray-600 min-h-16">{accountQuery.data?.message}</p>

//           <div className="card-actions flex-col">
//             <textarea
//               placeholder="更新金额"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="textarea textarea-bordered w-full mb-3 focus:ring-2 focus:ring-purple-500 transition-all"
//             />
//             <button
//               className={`btn btn-block ${
//                 updateLedgerEntry.isPending ? "btn-disabled" : "btn-primary"
//               } mb-3 transition-transform hover:-translate-y-0.5`}
//               onClick={handleSubmit}
//               disabled={updateLedgerEntry.isPending || !isFormValid}
//             >
//               {updateLedgerEntry.isPending ? (
//                 <span className="flex items-center justify-center">
//                   <span className="loading loading-spinner mr-2"></span>
//                   更新中...
//                 </span>
//               ) : (
//                 "更新账本条目"
//               )}
//             </button>
//           </div>

//           <div className="text-center space-y-3">
//             <div className="text-sm text-gray-500">
//               <ExplorerLink
//                 path={`account/${pda}`}
//                 label={ellipsify(pda.toString())}
//                 className="hover:text-purple-600 transition-colors"
//               />
//             </div>
//             <button
//               className="btn btn-sm btn-outline btn-error transition-transform hover:-translate-y-0.5"
//               onClick={() => {
//                 if (!window.confirm("确定要删除此条目吗？")) {
//                   return;
//                 }
//                 const title = accountQuery.data?.title;
//                 if (title) {
//                   return deleteLedgerEntry.mutateAsync(title);
//                 }
//               }}
//               disabled={deleteLedgerEntry.isPending}
//             >
//               {deleteLedgerEntry.isPending ? (
//                 <span className="flex items-center justify-center">
//                   <span className="loading loading-spinner mr-2"></span>
//                   删除中...
//                 </span>
//               ) : (
//                 "删除条目"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
