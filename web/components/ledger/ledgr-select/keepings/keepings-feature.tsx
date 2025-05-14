"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../../../solana/solana-provider";
import { AppHero, ellipsify } from "../../../ui/ui-layout";
import { ExplorerLink } from "../../../cluster/cluster-ui";
import { KeepingList} from "./keepings-ui";
import {JournalCreate} from "@/components/journal/journal-ui";
import { useLedgerProgram } from "../new-ledger/ledger-data-access";

export default function KeepingFeature() {
  const { publicKey } = useWallet();
  const { programId } = useLedgerProgram();

  return publicKey ? (
    <div>
      {/* <AppHero title="My Solana Journal" subtitle={"Create your journal here!"}> */}
      {/* <AppHero title="" subtitle={""}>
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
      <p className="mb-6"/> */}
        {/* <LedgerCreate /> */}
          {/*<TestComponent/>*/}

      {/* </AppHero> */}
            <KeepingList />
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
