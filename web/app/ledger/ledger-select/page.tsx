"use client";

import DashboardFeature from "@/components/dashboard/dashboard-feature";
import {JournalCreate1} from "@/components/journal/journal-ui";
import LedgerPage from "@/app/ledger/ledger-select/ledger";

export default function  NewLedger() {
    return (

        <div>
            <LedgerPage />
            <h1>New Ledger</h1>
        </div>
    )
}

// export default function Page() {
//     console.log("CCCCCCCCCCCCCCC");
//     return <DashboardFeature />;
// }