"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../../../solana/solana-provider";
import { AppHero, ellipsify } from "../../../ui/ui-layout";
import { ExplorerLink } from "../../../cluster/cluster-ui";
import { useLedgerProgram } from "./ledger-data-access";
import TestComponent, { LedgerCreate, LedgerList } from "./ledger-ui";
import { JournalCreate } from "@/components/journal/journal-ui";

export default function LedgerFeature() {
  const { publicKey } = useWallet();
  const { programId } = useLedgerProgram();

  return publicKey ? (
    <div>
      {/* <AppHero title="" subtitle={""}> */}
      <AppHero title="My Keeping Account" subtitle={"Create your ledger here!"}>
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <p className="mb-6" />
        <LedgerCreate onClose={() => {}} />
        {/*<TestComponent/>*/}
      </AppHero>
      <LedgerList />
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
