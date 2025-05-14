import type { NextPage } from 'next'
import Head from 'next/head'
import Link from "next/link";

const LedgerPage: NextPage = () => {
    // 账本数据
    const ledgers = [
        {
            id: 1,
            title: '家庭账本',
            tag: '官方推荐',
            description: '管理服务+家庭 ★ 分账软件在行教育医疗一应俱全',
            tags: ['家庭', '三餐', '英语'],
            users: '18,924,687人使用',
            featured: true
        },
        {
            id: 2,
            title: '日常账本',
            tag: '官方推荐',
            description: '简便好用的【日常账本】上线组分类齐全，符合生活的记账需求',
            tags: ['家庭', '三餐', '日新月发'],
            users: '9,797,041人使用',
            time: '6小时内'
        },
        {
            id: 3,
            title: '攒钱账本',
            tag: '精选',
            description: '账户功能，每天用钱付一元 ★ 收支分析，预算规划，攒钱费的好方法',
            tags: ['家庭', '三餐', '日新月发'],
            users: '192,607人使用'
        },
        {
            id: 4,
            title: '储蓄家庭账本',
            tag: '热门',
            description: '储蓄型家庭账本，管理服务+家庭 ★ 孩子教育，养老计划',
            tags: ['家庭', '三餐', '日新月发'],
            users: '110,853人使用'
        },
        {
            id: 5,
            title: '宝宝账本',
            tag: '特色账本',
            description: '借贷清单，用宝宝账本记录宝宝的成长吧 ★ 专业分类，关注宝宝的成长',
            tags: ['家庭', '三餐', '日新月发'],
            users: '236,639人使用'
        },
        {
            id: 6,
            title: '儿童教育账本',
            tag: '热门',
            description: '用普通话的方式获取孩子的健康 ★ 教育投入过一笔或加班 ★ 巧用账户每一',
            tags: ['家庭', '三餐', '日新月发'],
            users: '83,059人使用'
        },
        {
            id: 7,
            title: '我的负债账本',
            tag: '热门',
            description: '各类负债账户余额量 ★ 独立信用卡账户模块，多卡交通包 ★ 每月已还一',
            tags: ['家庭', '三餐', '日新月发'],
            users: '105,934人使用'
        },
        {
            id: 8,
            title: '消费家庭账本',
            tag: '热门',
            description: '分账软件在行教育医疗一应俱全 ★ 收入多少？支出多少？预算多少？',
            tags: ['家庭', '三餐', '日新月发'],
            users: '1,128,724人使用'
        },
        {
            id: 9,
            title: '资产负债账本',
            tag: '热门',
            description: '辛苦劳累，账户和缴费费用有多少钱？ ★ 银行卡太多，账户太多',
            tags: ['家庭', '三餐', '日新月发'],
            users: '138,580人使用'
        },
        {
            id: 10,
            title: '旅游账本',
            tag: '热门',
            description: '路上旅程，神奈西斯坦有时间打卡 超级饭水，看看钱都花在哪里',
            tags: ['家庭', '三餐', '日新月发'],
            users: '179,459人使用'
        },
        {
            id: 11,
            title: '结婚账本',
            tag: '热门',
            description: '1、结婚支出的方案多，随手一记全部通 2、对婚姻要求出预算 3、记账红包',
            tags: ['家庭', '三餐', '日新月发'],
            users: '69,568人使用'
        },
        {
            id: 12,
            title: '夫妻理财账本',
            tag: '特色账本',
            description: '夫妻理财账本，夫妻双亲还款 单日均花费多少钱统计，理赔投资情况',
            tags: ['家庭', '三餐', '日新月发'],
            users: '79,527人使用'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>家庭账本应用</title>
                <meta name="description" content="多功能家庭账本管理平台" />
            </Head>

            <main className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold text-center mb-8 text-primary">家庭账本应用</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ledgers.map((ledger) => (
                        <div
                            key={ledger.id}
                            className={`card bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                                ledger.featured ? 'border-2 border-yellow-400' : ''
                            }`}
                        >
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <h2 className="card-title text-xl">
                                        {ledger.title}
                                        {ledger.featured && (
                                            <span className="ml-2 text-yellow-500">★</span>
                                        )}
                                    </h2>
                                    <span className="badge badge-primary">{ledger.tag}</span>
                                </div>

                                <p className="text-gray-600 mt-2">{ledger.description}</p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {ledger.tags.map((tag, index) => (
                                        <span key={index} className="badge badge-outline">{tag}</span>
                                    ))}
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{ledger.users}</span>
                                    {ledger.time && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {ledger.time}
                    </span>
                                    )}
                                </div>

                                <div className="card-actions justify-end mt-4">
                                    <Link href="/ledger/ledger-select/keepings/1">
                                    <button className="btn btn-sm btn-primary">立即使用</button>
                                    </Link>
                                    <button className="btn btn-sm btn-outline">查看详情</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default LedgerPage