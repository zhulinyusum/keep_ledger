// "use client"
// import { useState } from 'react'
// import Head from 'next/head'

// const AccountingPage = () => {
//   const [amount, setAmount] = useState('')
//   const [category, setCategory] = useState('')
//   const [account, setAccount] = useState('')
//   const [member, setMember] = useState('所有 / 156****2800')
//   const [merchant, setMerchant] = useState('')
//   const [project, setProject] = useState('')
//   const [note, setNote] = useState('')
//   const [transactionType, setTransactionType] = useState('支出')

//   // 模拟数据
//   const categories = ['餐饮', '交通', '购物', '娱乐', '医疗', '教育']
//   const accounts = ['现金', '支付宝', '微信钱包', '银行卡', '信用卡']
//   const merchants = ['超市', '餐厅', '网购平台', '加油站', '电影院']
//   const projects = ['家庭日常', '个人消费', '旅行', '投资', '还款']

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Head>
//         <title>记账</title>
//         <meta name="description" content="多功能记账应用" />
//       </Head>

//       <main className="container mx-auto py-6 px-4 max-w-2xl">
//         {/* 顶部操作栏 */}
//         <div className="flex justify-between mb-6">
//           <div className="tabs tabs-boxed">
//             <button className="tab tab-active">记一笔</button>
//             <button className="tab">记多笔</button>
//             {/*<button className="tab">数据导入</button>*/}
//           </div>
//         </div>

//         {/* 交易类型选择 */}
//         <div className="flex justify-around bg-white rounded-lg shadow p-2 mb-6">
//           {['支出', '收入'].map((type) => (
//             <button
//               key={type}
//               className={`btn btn-sm ${transactionType === type ? 'btn-primary' : 'btn-ghost'}`}
//               onClick={() => setTransactionType(type)}
//             >
//               {type}
//             </button>
//           ))}
//         </div>

//         {/* 记账表单 */}
//         <div className="bg-white rounded-lg shadow p-6">
//           {/* 金额 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">金额*</span>
//             </label>
//             <input
//               type="text"
//               placeholder="输入金额"
//               className="input input-bordered w-full"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//             />
//           </div>

//           {/* 分类 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">分类*</span>
//             </label>
//             <select
//               className="select select-bordered w-full"
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//             >
//               <option disabled value="">请选择</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>

//           {/* 账户 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">账户*</span>
//             </label>
//             <select
//               className="select select-bordered w-full"
//               value={account}
//               onChange={(e) => setAccount(e.target.value)}
//             >
//               <option disabled value="">请选择</option>
//               {accounts.map((acc) => (
//                 <option key={acc} value={acc}>{acc}</option>
//               ))}
//             </select>
//           </div>

//           {/* 记账时间 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">记账时间</span>
//             </label>
//             <input
//               type="text"
//               className="input input-bordered w-full"
//               value="2025-05-05 01:16:47"
//               readOnly
//             />
//           </div>

//           {/* 成员 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">成员*</span>
//             </label>
//             <input
//               type="text"
//               className="input input-bordered w-full"
//               value={member}
//               onChange={(e) => setMember(e.target.value)}
//             />
//           </div>

//           {/* 商家 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">商家</span>
//             </label>
//             <select
//               className="select select-bordered w-full"
//               value={merchant}
//               onChange={(e) => setMerchant(e.target.value)}
//             >
//               <option disabled value="">请选择</option>
//               {merchants.map((m) => (
//                 <option key={m} value={m}>{m}</option>
//               ))}
//             </select>
//           </div>

//           {/* 项目 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">项目</span>
//             </label>
//             <select
//               className="select select-bordered w-full"
//               value={project}
//               onChange={(e) => setProject(e.target.value)}
//             >
//               <option disabled value="">请选择</option>
//               {projects.map((p) => (
//                 <option key={p} value={p}>{p}</option>
//               ))}
//             </select>
//           </div>

//           {/* 备注 */}
//           <div className="form-control mb-4">
//             <label className="label">
//               <span className="label-text font-bold">备注</span>
//               <span className="label-text-alt">{note.length}/50</span>
//             </label>
//             <textarea
//               className="textarea textarea-bordered w-full"
//               placeholder="请输入备注"
//               rows={3}
//               maxLength={50}
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//             ></textarea>
//           </div>

//           {/* 图片上传 */}
//           <div className="form-control mb-6">
//             <label className="label">
//               <span className="label-text font-bold">图片（最多9张）</span>
//             </label>
//             <div className="border-2 border-dashed rounded-lg p-8 text-center">
//               <p className="text-gray-500">上传高清原图</p>
//             </div>
//           </div>

//           {/* 操作按钮 */}
//           <div className="flex justify-center space-x-4">
//             <button className="btn btn-primary px-8">保存</button>
//             <button className="btn btn-outline px-8">保存并再记一笔</button>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default AccountingPage