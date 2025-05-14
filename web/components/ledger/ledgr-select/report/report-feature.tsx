"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../../../solana/solana-provider";
import { AppHero, ellipsify } from "../../../ui/ui-layout";
import { ExplorerLink } from "../../../cluster/cluster-ui";
import { ReportPage } from "./report-ui";
import { JournalCreate } from "@/components/journal/journal-ui";
import { useLedgerProgram } from "../new-ledger/ledger-data-access";

export default function ReportFeature() {
  const { publicKey } = useWallet();
  const { programId } = useLedgerProgram();

  return publicKey ? (
    <div>
      <AppHero title="" subtitle={""}>
      {/* <AppHero title="My Solana Journal" subtitle={"Create your journal here!"}> */}
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <p className="mb-6" />
        {/* <LedgerCreate /> */}
        {/*<TestComponent/>*/}
      </AppHero>
      <ReportPage />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
